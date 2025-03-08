
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Volume2, Volume1, VolumeX, Maximize2, Minimize2, Settings, ChevronRight } from 'lucide-react';
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
  const [showSettings, setShowSettings] = useState(false);
  const [qualities, setQualities] = useState<{ height: number; level: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 means auto
  
  // Bypass CORS by using a proxy for certain streams
  const getProxiedUrl = (url: string): string => {
    // Check if it's a Pluto TV stream
    if (url.includes('pluto.tv') && url.includes('.m3u8')) {
      // Replace direct Pluto TV URLs with a working alternative
      // Or use a proxy if available
      const streamPath = url.split('/').slice(-2).join('/');
      return `https://i.mjh.nz/PlutoTV/${streamPath}`;
    }
    return url;
  };
  
  useEffect(() => {
    // Cleanup function to handle component unmounting
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
    
    // Reset states
    setIsLoading(true);
    setError(null);
    
    const proxiedSrc = getProxiedUrl(src);
    const isHlsStream = proxiedSrc.includes('.m3u8');
    const isMpdStream = proxiedSrc.includes('.mpd');
    
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
              autoStartLoad: true,
              startLevel: -1, // Auto quality by default
              capLevelToPlayerSize: true, // Adjust quality based on player size
              debug: false
            });
            hlsInstanceRef.current = hls;
            
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              hls.loadSource(proxiedSrc);
            });
            
            hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
              // Extract available qualities
              const availableQualities = data.levels.map((level: any, index: number) => ({
                height: level.height,
                level: index,
              }));
              setQualities(availableQualities);
              
              setIsLoading(false);
              video.play().catch(playError => {
                console.warn('Auto-play failed:', playError);
                // We'll still consider this successful, user can click play
              });
            });
            
            hls.on(Hls.Events.ERROR, (_, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  setError(`Network error: The stream at ${proxiedSrc.split('/').pop()} is unavailable or blocked by CORS policy.`);
                } else {
                  setError(`Error loading stream: ${data.details}`);
                }
                setIsLoading(false);
                hls.destroy();
              }
            });
            
            // Add level switching event to update current quality state
            hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
              setCurrentQuality(data.level);
            });
          } 
          // For Safari which has native HLS support
          else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = proxiedSrc;
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
            
            // Configure auto quality selection
            shakaPlayer.configure({
              abr: {
                enabled: true,
                defaultBandwidthEstimate: 1000000 // 1Mbps initial estimate
              }
            });
            
            // Load the manifest
            await shakaPlayer.load(proxiedSrc);
            console.log('The video has been loaded');
            setIsLoading(false);
            
            // Get available video tracks for quality selection
            const tracks = shakaPlayer.getVariantTracks();
            const videoQualities = tracks
              .filter((track: any) => track.type === 'variant' && track.height)
              .map((track: any, index: number) => ({
                height: track.height,
                level: index
              }));
            
            setQualities(videoQualities);
            
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
          video.src = proxiedSrc;
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
  
  const handleQualityChange = (level: number) => {
    if (hlsInstanceRef.current) {
      console.log(`Switching to quality level: ${level}`);
      hlsInstanceRef.current.currentLevel = level;
      setCurrentQuality(level);
      setShowSettings(false);
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
            
            {/* Quality selector */}
            {qualities.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "text-white transition-colors p-1 rounded-full",
                    showSettings ? "bg-[#ea384c] text-white hover:bg-[#ea384c]/90" : "hover:text-[#ea384c]"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 bottom-full mb-2 bg-[#1A1F2C]/95 rounded-lg backdrop-blur-sm border border-white/10 animate-fade-in z-30 w-[180px]">
                    <div className="p-3 space-y-1">
                      <h4 className="text-white text-sm font-medium mb-2">Quality</h4>
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all",
                          currentQuality === -1 
                            ? "bg-[#ea384c] text-white" 
                            : "text-white/80 hover:bg-white/10"
                        )}
                      >
                        <span>Auto</span>
                        {currentQuality === -1 && (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {qualities.map(({ height, level }) => (
                        <button
                          key={level}
                          onClick={() => handleQualityChange(level)}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-all",
                            currentQuality === level 
                              ? "bg-[#ea384c] text-white" 
                              : "text-white/80 hover:bg-white/10"
                          )}
                        >
                          <span>{height}p</span>
                          {currentQuality === level && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
