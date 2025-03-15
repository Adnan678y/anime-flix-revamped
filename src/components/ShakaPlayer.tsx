import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Volume2, Volume1, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

// Declare shaka globally since TypeScript has issues with the module definition
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hlsInstanceRef = useRef<Hls | null>(null);
  
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

    // Clean up previous playback
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
              xhrSetup: (xhr) => {
                xhr.withCredentials = false;
              },
              autoLevelEnabled: true,
              startLevel: -1,
              capLevelToPlayerSize: true
            });
            hlsInstanceRef.current = hls;
            hls.attachMedia(video);

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              console.log("Loading HLS stream:", src);
              hls.loadSource(src);
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              console.log("HLS manifest parsed. Available quality levels:", hls.levels);
              video.play().catch(console.warn);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                console.error('HLS stream error:', data);
                setError(`Error loading stream: ${data.details}`);
                setIsLoading(false);
                hls.destroy();
              }
            });
          } 
          else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
              setIsLoading(false);
              video.play().catch(console.error);
            });
            video.addEventListener('error', () => {
              setError(`Error loading stream: ${video.error?.message || 'Unknown error'}`);
              setIsLoading(false);
            });
          } 
          else {
            setError('Your browser does not support HLS streams.');
            setIsLoading(false);
          }
        } 
        else if (isMpdStream) {
          if (typeof shaka === 'undefined') {
            console.error('Shaka player not loaded');
            setError('Video player failed to load');
            setIsLoading(false);
            return;
          }

          shaka.polyfill.installAll();

          if (!shaka.Player.isBrowserSupported()) {
            setError('Browser not supported for DASH streaming');
            setIsLoading(false);
            return;
          }

          const shakaPlayer = new shaka.Player(video);

          shakaPlayer.configure({
            abr: {
              enabled: true,
              defaultBandwidthEstimate: 500000,
              switchInterval: 1,
            }
          });

          shakaPlayer.addEventListener('error', (event: any) => {
            console.error('Shaka error', event.detail);
            setError(`Playback error: ${event.detail.message}`);
            setIsLoading(false);
          });

          try {
            if (drmKey) {
              const [keyId, key] = drmKey.split(':');
              shakaPlayer.configure({
                drm: {
                  clearKeys: { [keyId]: key }
                }
              });
            }

            await shakaPlayer.load(src);
            console.log('The video has been loaded');
            setIsLoading(false);
            video.play().catch(console.error);
          } catch (error) {
            console.error('Error loading stream:', error);
            setError(`Failed to load stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsLoading(false);
          }
        }
        else {
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
        console.error('Error initializing player:', error);
        setError('Failed to initialize video player');
        setIsLoading(false);
      }
    };

    loadContent();

    return () => {
      video.removeEventListener('loadeddata', () => {});
      video.removeEventListener('error', () => {});
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, [src, drmKey]);

  return (
    <div ref={containerRef} className="relative w-full bg-black group transition-all duration-300">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-12 h-12 text-[#ea384c] animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-netflix-dark/90 p-6 rounded-lg text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Stream Error</h3>
            <p className="text-white/80">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-netflix-red text-white rounded-md hover:bg-netflix-red/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <video ref={videoRef} className="w-full h-full" poster={poster} controls={false} />
    </div>
  );
};

export default ShakaPlayer;
