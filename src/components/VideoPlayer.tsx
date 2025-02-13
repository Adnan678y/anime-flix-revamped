import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Volume2, Volume1, VolumeX, Play, Pause, Settings, Loader2, RotateCcw, RotateCw, Maximize2, Minimize2, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoPlayerProps {
  url: string;
}

type SettingsMenuType = 'main' | 'playback' | 'quality';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState<{ height: number; level: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef<number>();
  const hlsRef = useRef<Hls | null>(null);
  const isMobile = useIsMobile();
  const [currentMenu, setCurrentMenu] = useState<SettingsMenuType>('main');
  const [timePreview, setTimePreview] = useState<{ time: number; position: number } | null>(null);
  const doubleTapTimeoutRef = useRef<number>();
  const [showDoubleTapIndicator, setShowDoubleTapIndicator] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
        debug: false,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const availableQualities = data.levels.map((level, index) => ({
          height: level.height,
          level: index,
        }));
        setQualities(availableQualities);
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Failed to load video stream');
          setLoading(false);
        }
      });

      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);

      return () => {
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);
        hls.destroy();
      };
    }
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };

  const handleTimeSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = offsetX / rect.width;
    const newTime = percentage * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleTimePreview = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    return formatTime(percentage * duration);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
      setShowSettings(false);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgressBarStyles = () => {
    const progress = (currentTime / duration) * 100;
    return {
      background: `linear-gradient(to right, #ea384c ${progress}%, #403E43 ${progress}%)`,
    };
  };

  const getBufferedRanges = () => {
    if (!videoRef.current?.buffered) return [];
    const ranges = [];
    const buffered = videoRef.current.buffered;
    for (let i = 0; i < buffered.length; i++) {
      ranges.push({
        start: buffered.start(i),
        end: buffered.end(i)
      });
    }
    return ranges;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 3000);
  };

  const handleMouseMoveProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const previewTime = percentage * duration;
    
    setTimePreview({
      time: previewTime,
      position: offsetX,
    });
  };

  const handleMouseLeaveProgress = () => {
    setTimePreview(null);
  };

  const renderSettingsMenu = () => {
    switch (currentMenu) {
      case 'main':
        return (
          <div className="space-y-1">
            <button
              onClick={() => setCurrentMenu('playback')}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-md text-white/80 hover:bg-white/10"
            >
              <span>Playback Speed</span>
              <div className="flex items-center gap-2">
                <span className="text-white/60">{playbackSpeed}x</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
            {qualities.length > 0 && (
              <button
                onClick={() => setCurrentMenu('quality')}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-md text-white/80 hover:bg-white/10"
              >
                <span>Quality</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">
                    {qualities[currentQuality]?.height}p
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>
        );

      case 'playback':
        return (
          <>
            <button
              onClick={() => setCurrentMenu('main')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Playback Speed</span>
            </button>
            <div className="grid grid-cols-3 gap-1.5">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    handleSpeedChange(speed);
                    setCurrentMenu('main');
                  }}
                  className={cn(
                    "px-3 py-2 text-sm rounded-md transition-all",
                    playbackSpeed === speed 
                      ? "bg-[#ea384c] text-white" 
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </>
        );

      case 'quality':
        return (
          <>
            <button
              onClick={() => setCurrentMenu('main')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quality</span>
            </button>
            <div className="space-y-1">
              {qualities.map(({ height, level }) => (
                <button
                  key={level}
                  onClick={() => {
                    handleQualityChange(level);
                    setCurrentMenu('main');
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-md transition-all",
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
          </>
        );
    }
  };

  const handleDoubleTap = (direction: 'left' | 'right') => {
    handleSkip(direction === 'left' ? -10 : 10);
    setShowDoubleTapIndicator(direction);
    setTimeout(() => setShowDoubleTapIndicator(null), 500);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const side = x < rect.width / 2 ? 'left' : 'right';

    if (doubleTapTimeoutRef.current) {
      window.clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = undefined;
      handleDoubleTap(side);
    } else {
      doubleTapTimeoutRef.current = window.setTimeout(() => {
        doubleTapTimeoutRef.current = undefined;
        handlePlayPause();
      }, 300);
    }
  };

  if (error) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-black text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full bg-black group transition-all duration-300",
        isFullscreen ? "h-screen" : "aspect-video"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(false);
        }
      }}
      onTouchEnd={handleTouchEnd}
    >
      {(loading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#ea384c] animate-spin" />
            <span className="text-white/80 text-sm">
              {loading ? 'Loading video...' : 'Buffering...'}
            </span>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        playsInline
        onClick={handlePlayPause}
      />

      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1F2C]/90 via-[#1A1F2C]/50 to-transparent px-2 sm:px-4 py-4 sm:py-6 transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex flex-col gap-2 sm:gap-3 max-w-screen-lg mx-auto">
          <div className="relative group/progress">
            {timePreview && (
              <div 
                className="absolute bottom-full mb-2 bg-[#1A1F2C] text-white text-sm px-2 py-1 rounded transform -translate-x-1/2 pointer-events-none backdrop-blur-sm"
                style={{ left: timePreview.position }}
              >
                {formatTime(timePreview.time)}
              </div>
            )}
            
            <div 
              className="w-full h-2 sm:h-1.5 rounded-full cursor-pointer relative overflow-hidden transition-all group-hover/progress:h-3 sm:group-hover/progress:h-2.5"
              onClick={handleTimeSeek}
              onTouchStart={handleTimeSeek}
              onMouseMove={handleMouseMoveProgress}
              onMouseLeave={handleMouseLeaveProgress}
            >
              {/* Buffered ranges */}
              {getBufferedRanges().map((range, index) => {
                const start = (range.start / duration) * 100;
                const end = (range.end / duration) * 100;
                const width = end - start;
                return (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 bg-white/20"
                    style={{
                      left: `${start}%`,
                      width: `${width}%`,
                    }}
                  />
                );
              })}
              
              {/* Progress bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-[#ea384c] rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#ea384c] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 w-full h-full opacity-0 group-hover/progress:opacity-20 bg-gradient-to-r from-white/0 via-white to-white/0 transition-opacity" />
            </div>

            {/* Timestamps */}
            <div className="flex justify-between items-center mt-1 text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(duration - currentTime)}</span>
            </div>
          </div>

          <div className={cn(
            "grid items-center gap-4",
            isMobile ? "grid-cols-[auto_1fr_auto_auto]" : "grid-cols-[auto_auto_auto_1fr_auto_auto_auto]"
          )}>
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-[#ea384c] transition-colors p-2"
            >
              {isPlaying ? 
                <Pause className="w-6 h-6 sm:w-6 sm:h-6" /> : 
                <Play className="w-6 h-6 sm:w-6 sm:h-6" />
              }
            </button>

            {!isMobile && (
              <>
                <button
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-[#ea384c] transition-colors p-2"
                >
                  <RotateCcw className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-[#ea384c] transition-colors p-2"
                >
                  <RotateCw className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            <div className={cn(
              "flex items-center gap-2 group/volume",
              isMobile ? "w-20 sm:w-24" : "w-24 sm:w-32"
            )}>
              <button 
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                className="text-white hover:text-[#ea384c] transition-colors p-2"
              >
                {volume === 0 ? (
                  <VolumeX className="w-6 h-6 sm:w-6 sm:h-6" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-6 h-6 sm:w-6 sm:h-6" />
                ) : (
                  <Volume2 className="w-6 h-6 sm:w-6 sm:h-6" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 accent-[#ea384c] bg-[#403E43] rounded-full appearance-none cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>

            <div className="flex items-center gap-2 justify-end ml-auto">
              <span className="text-white/90 text-sm sm:text-base font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "text-white transition-colors p-2 rounded-full",
                    showSettings ? "bg-[#ea384c] text-white hover:bg-[#ea384c]/90" : "hover:text-[#ea384c]"
                  )}
                >
                  <Settings className="w-6 h-6 sm:w-6 sm:h-6" />
                </button>

                {showSettings && (
                  <div className="absolute right-0 bottom-full mb-2 bg-[#1A1F2C]/95 rounded-lg backdrop-blur-sm border border-white/10 animate-fade-in z-30 w-[280px] max-h-[calc(100vh-120px)] overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {renderSettingsMenu()}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#ea384c] transition-colors p-2"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-6 h-6 sm:w-6 sm:h-6" />
                ) : (
                  <Maximize2 className="w-6 h-6 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobile && showControls && (
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-4 sm:px-8 pointer-events-none">
          <button
            onClick={() => handleSkip(-10)}
            className="text-white/80 hover:text-white pointer-events-auto p-4 sm:p-5 bg-black/40 rounded-full backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
          <button
            onClick={() => handleSkip(10)}
            className="text-white/80 hover:text-white pointer-events-auto p-4 sm:p-5 bg-black/40 rounded-full backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <RotateCw className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>
      )}

      {showDoubleTapIndicator && (
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-20 h-20 bg-black/40 rounded-full flex items-center justify-center transition-all duration-300 animate-fade-in",
            showDoubleTapIndicator === 'left' ? "left-8" : "right-8"
          )}
        >
          {showDoubleTapIndicator === 'left' ? (
            <RotateCcw className="w-10 h-10 text-white" />
          ) : (
            <RotateCw className="w-10 h-10 text-white" />
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
