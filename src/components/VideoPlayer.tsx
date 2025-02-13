
import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create video element
    const videoElement = document.createElement('video');
    videoElement.className = 'swift-streamer-player';
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('controls', '');
    
    if (poster) {
      videoElement.setAttribute('poster', poster);
    }

    // Add source
    const sourceElement = document.createElement('source');
    sourceElement.src = src;
    sourceElement.type = 'video/mp4';
    videoElement.appendChild(sourceElement);

    // Initialize Swift Streamer
    try {
      const player = new window.SwiftStreamer(videoElement, {
        autoplay: false,
        theme: 'dark',
        controls: true,
        settings: true,
        keyboard: true,
        pip: true,
        airplay: true,
        volume: 100,
        quality: {
          default: 720,
          options: [2160, 1440, 1080, 720, 480, 360, 240]
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        }
      });

      // Clear container and append new player
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(videoElement);

      return () => {
        if (player && typeof player.destroy === 'function') {
          player.destroy();
        }
      };
    } catch (error) {
      console.error('Failed to initialize Swift Streamer:', error);
      // Fallback to native video player if Swift Streamer fails
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(videoElement);
    }
  }, [src, poster]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black" />
  );
};
