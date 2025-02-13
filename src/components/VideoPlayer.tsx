
import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Swift player
    const video = document.createElement('video');
    video.className = 'swift-player';
    video.setAttribute('playsinline', '');
    video.setAttribute('controls', '');
    video.poster = poster || '';

    // Add video source
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);

    // Configure Swift player
    const player = new window.SwiftPlayer(video, {
      controls: {
        autohide: 3000,
        hotkeys: true
      },
      settings: {
        enabled: true,
        export: true,
        animations: true
      },
      contextmenu: {
        enabled: true,
        keepinside: true
      }
    });

    // Clean up previous video if any
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(video);

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [src, poster]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black swift-player-container"
    />
  );
};
