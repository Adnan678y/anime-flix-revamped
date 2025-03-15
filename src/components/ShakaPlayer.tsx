import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Volume2, Volume1, VolumeX, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

declare const shaka: any;

interface ShakaPlayerProps {
  src: string;
  drmKey?: string;
  poster?: string;
  title?: string;
}

const ShakaPlayer: React.FC<ShakaPlayerProps> = ({ src, drmKey, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualityLevels, setQualityLevels] = useState<number[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | 'auto'>('auto');

  useEffect(() => {
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    const isHlsStream = src.includes('.m3u8');
    const isMpdStream = src.includes('.mpd');

    const loadContent = async () => {
      try {
        if (isHlsStream) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              autoLevelEnabled: true,
              startLevel: -1,
              capLevelToPlayerSize: true,
            });
            hlsInstanceRef.current = hls;

            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              hls.loadSource(src);
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              setQualityLevels(hls.levels.map((level, index) => index));
              video.play().catch(console.error);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                console.error('HLS error:', data);
                setError(`Stream error: ${data.details}`);
                setIsLoading(false);
                hls.destroy();
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
              setIsLoading(false);
              video.play().catch(console.error);
            });
            video.addEventListener('error', () => {
              setError(`Error loading stream: ${video.error?.message || 'Unknown error'}`);
              setIsLoading(false);
            });
          } else {
            setError('Your browser does not support HLS.');
            setIsLoading(false);
          }
        } else if (isMpdStream) {
          if (typeof shaka === 'undefined') {
            setError('Shaka Player not loaded');
            setIsLoading(false);
            return;
          }

          shaka.polyfill.installAll();
          if (!shaka.Player.isBrowserSupported()) {
            setError('DASH streaming is not supported in this browser.');
            setIsLoading(false);
            return;
          }

          const shakaPlayer = new shaka.Player(video);
          shakaPlayer.configure({
            abr: {
              enabled: true,
              defaultBandwidthEstimate: 500000,
            },
          });

          shakaPlayer.addEventListener('error', (event: any) => {
            console.error('Shaka error:', event.detail);
            setError(`Playback error: ${event.detail.message}`);
            setIsLoading(false);
          });

          if (drmKey) {
            const [keyId, key] = drmKey.split(':');
            shakaPlayer.configure({
              drm: {
                clearKeys: {
                  [keyId]: key,
                },
              },
            });
          }

          await shakaPlayer.load(src);
          setIsLoading(false);
          video.play().catch(console.error);
        } else {
          video.src = src;
          video.addEventListener('loadeddata', () => {
            setIsLoading(false);
            video.play().catch(console.error);
          });
          video.addEventListener('error', () => {
            setError(`Error loading stream: ${video.error?.message || 'Unknown error'}`);
            setIsLoading(false);
          });
        }
      } catch (error) {
        setError('Failed to load video');
        setIsLoading(false);
      }
    };

    loadContent();
  }, [src, drmKey]);

  const handleFullscreenToggle = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    setIsFullscreen(!!document.fullscreenElement);
  };

  const handleQualityChange = (level: number | 'auto') => {
    if (hlsInstanceRef.current) {
      if (level === 'auto') {
        hlsInstanceRef.current.currentLevel = -1;
      } else {
        hlsInstanceRef.current.currentLevel = level;
      }
      setSelectedQuality(level);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black group transition-all duration-300',
        isFullscreen ? 'h-screen' : 'aspect-video'
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="p-6 bg-gray-900 text-white rounded-lg text-center">
            <h3 className="text-xl font-bold">Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-500">
              Retry
            </button>
          </div>
        </div>
      )}

      <video ref={videoRef} className="w-full h-full" poster={poster} controls={false} />

      {/* Controls */}
      <div className={cn('absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3', showControls ? 'opacity-100' : 'opacity-0')}>
        <div className="flex justify-between items-center">
          {title && <h3 className="text-white">{title}</h3>}

          <div className="flex items-center gap-4">
            <select value={selectedQuality} onChange={(e) => handleQualityChange(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}>
              <option value="auto">Auto</option>
              {qualityLevels.map((level) => (
                <option key={level} value={level}>
                  {level === 0 ? 'Lowest' : `Quality ${level}`}
                </option>
              ))}
            </select>

            <button onClick={handleFullscreenToggle} className="text-white hover:text-red-500">
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShakaPlayer;
