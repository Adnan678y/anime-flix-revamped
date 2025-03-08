
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
    // Cleanup function to handle component unmounting
    return () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, []);
  
  // Helper function to bypass CORS for HLS streams
  const getProxiedUrl = (originalUrl: string) => {
    if (originalUrl.includes('.m3u8') && !originalUrl.includes('corsproxy.io')) {
      return `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    
    // Clean up previous playback
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }
    
    // Reset states
    setIsLoading(true);
    setError(null);
    
    const isHlsStream = src.includes('.m3u8');
    const isMpdStream = src.includes('.mpd');
    
    const loadContent = async () => {
      try {
        // HLS Stream handling
        if (isHlsStream) {
          // Check if HLS.js is supported
          if (Hls.isSupported()) {
            const hls = new Hls({
              xhrSetup: (xhr) => {
                xhr.withCredentials = false; // Try without credentials for CORS
              },
              // Enable auto quality selection
              autoLevelEnabled: true,
              startLevel: -1, // -1 means auto
              capLevelToPlayerSize: true
            });
            hlsInstanceRef.current = hls;
            
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              // Use the proxied URL for HLS streams
              const proxiedUrl = getProxiedUrl(src);
              console.log("Loading HLS stream with proxied URL:", proxiedUrl);
              hls.loadSource(proxiedUrl);
            });
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              console.log("HLS manifest parsed. Available quality levels:", hls.levels);
              video.play().catch(playError => {
                console.warn('Auto-play failed:', playError);
                // We'll still consider this successful, user can click play
              });
            });
            
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                console.error('HLS stream error:', data);
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  setError(`Network error: The stream is unavailable or blocked. Trying with proxy.`);
                  
                  // If we already tried with the proxy and it's still failing
                  if (src.includes('corsproxy.io')) {
                    setError(`Error loading stream: ${data.details}`);
                    setIsLoading(false);
                    hls.destroy();
                  } else {
                    // Try once more with the proxy if we haven't yet
                    const proxiedUrl = getProxiedUrl(src);
                    console.log("Retrying with proxied URL:", proxiedUrl);
                    hls.loadSource(proxiedUrl);
                  }
                } else {
                  setError(`Error loading stream: ${data.details}`);
                  setIsLoading(false);
                  hls.destroy();
                }
              }
            });
          } 
          // For Safari which has native HLS support
          else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Still use proxied URL for Safari
            const proxiedUrl = getProxiedUrl(src);
            video.src = proxiedUrl;
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
        // MPEG-DASH Stream handling
        else if (isMpdStream) {
          // We'll use the global shaka object that's loaded via script tag
          if (typeof shaka === 'undefined') {
            console.error('Shaka player not loaded');
            setError('Video player failed to load');
            setIsLoading(false);
            return;
          }
          
          // Install polyfills
          shaka.polyfill.installAll();
          
          // Check browser support
          if (!shaka.Player.isBrowserSupported()) {
            setError('Browser not supported for DASH streaming');
            setIsLoading(false);
            return;
          }
          
          // Initialize player
          const shakaPlayer = new shaka.Player(video);
          
          // Configure for auto quality selection (ABR)
          shakaPlayer.configure({
            abr: {
              enabled: true,
              defaultBandwidthEstimate: 500000, // Initial bandwidth estimate in bits/sec
              switchInterval: 1, // How often ABR can switch streams (in seconds)
            }
          });
          
          // Error handling
          shakaPlayer.addEventListener('error', (event: any) => {
            console.error('Shaka error code', event.detail.code, 'object', event.detail);
            setError(`Playback error: ${event.detail.message}`);
            setIsLoading(false);
          });
          
          try {
            // Configure DRM if needed
            if (drmKey) {
              const [keyId, key] = drmKey.split(':');
              
              shakaPlayer.configure({
                drm: {
                  clearKeys: {
                    [keyId]: key
                  }
                }
              });
            }
            
            // Load the manifest
            await shakaPlayer.load(src);
            console.log('The video has been loaded');
            setIsLoading(false);
            
            // Start playback
            video.play().catch(error => {
              console.error('Error playing video:', error);
            });
          } catch (error) {
            console.error('Error loading stream:', error);
            setError(`Failed to load stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsLoading(false);
          }
        }
        // Regular video playback for other formats
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
    
    // Cleanup function
    return () => {
      video.removeEventListener('loadeddata', () => {});
      video.removeEventListener('error', () => {});
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
      }
    };
  }, [src, drmKey]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (volume === 0) {
      // If currently muted, restore to previous volume or default to 1
      const newVolume = videoRef.current.dataset.previousVolume ? 
        parseFloat(videoRef.current.dataset.previousVolume) : 1;
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
    } else {
      // If not muted, save current volume and then mute
      videoRef.current.dataset.previousVolume = volume.toString();
      setVolume(0);
      videoRef.current.volume = 0;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full bg-black group transition-all duration-300",
        isFullscreen ? "h-screen" : "aspect-video"
      )}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#ea384c] animate-spin" />
            <span className="text-white/80 text-sm">Loading stream...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-netflix-dark/90 p-6 rounded-lg max-w-md text-center space-y-4">
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
      
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        controls={false}
      />
      
      {/* Custom controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-6 transition-all duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex justify-between items-center gap-4">
          {title && (
            <h3 className="text-white text-sm md:text-base font-medium">{title}</h3>
          )}
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 group/volume">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-[#ea384c] transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 accent-[#ea384c] bg-[#403E43] rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#ea384c] transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShakaPlayer;
