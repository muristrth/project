import React, { useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VideoBackgroundProps {
  videoUrl: string;
  overlayContent?: React.ReactNode;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  videoUrl, 
  overlayContent, 
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(console.error);
      setIsPlaying(true);
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-dj-in-a-party-1210-large.mp4" type="video/mp4" />
      </video>
      
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-pink-900/70 to-orange-900/90" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-bounce opacity-80" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-pink-400 rounded-full animate-ping opacity-30" />
      </div>
      
      {/* Video Controls */}
      <div className="absolute bottom-6 right-6 flex space-x-3">
        <button
          onClick={togglePlayPause}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
        >
          {isPlaying ? <Play className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Content Overlay */}
      {overlayContent && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {overlayContent}
        </div>
      )}
    </div>
  );
};

export default VideoBackground;