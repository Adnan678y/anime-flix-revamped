
import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr>();

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['captions', 'quality', 'speed', 'loop'],
      quality: {
        default: 720,
        options: [4320, 2880, 2160, 1440, 1080, 720, 480, 360, 240]
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
      },
    });

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;
    
    // Update source when it changes
    playerRef.current.source = {
      type: 'video',
      sources: [
        {
          src,
          type: 'video/mp4',
        },
      ],
    };
  }, [src]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
