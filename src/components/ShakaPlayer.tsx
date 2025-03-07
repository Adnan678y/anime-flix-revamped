
import React, { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player';
import { Loader2, Volume2, Volume1, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    
    // Install polyfills
    shaka.polyfill.installAll();
    
    // Check browser support
    if (!shaka.Player.isBrowserSupported()) {
      setError('Browser not supported for streaming');
      setIsLoading(false);
      return;
    }
    
    // Initialize player
    const shakaPlayer = new shaka.Player(video);
    
    // Error handling
    shakaPlayer.addEventListener('error', (event) => {
      console.error('Error code', event.detail.code, 'object', event.detail);
      setError(`Playback error: ${event.detail.message}`);
      setIsLoading(false);
    });
    
    const loadStream = async () => {
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
    };
    
    loadStream();
    
    // Cleanup
    return () => {
      shakaPlayer.destroy();
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
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
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
