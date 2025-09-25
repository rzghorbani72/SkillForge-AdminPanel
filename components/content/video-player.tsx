'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Eye
} from 'lucide-react';
import { Media } from '@/types/api';

interface VideoPlayerProps {
  video: Media;
  autoPlay?: boolean;
  showControls?: boolean;
  onVideoEnd?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function VideoPlayer({
  video,
  autoPlay = false,
  showControls = true,
  onVideoEnd,
  onTimeUpdate
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      onTimeUpdate?.(videoElement.currentTime, videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate, onVideoEnd]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      videoElement.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newTime = parseFloat(e.target.value);
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newVolume = parseFloat(e.target.value);
    videoElement.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const skipTime = (seconds: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = Math.max(
      0,
      Math.min(videoElement.currentTime + seconds, videoElement.duration)
    );
  };

  const restart = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{video.title}</CardTitle>
            <CardDescription className="mt-1">
              {video.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {formatTime(duration)}
            </Badge>
            <Badge variant="outline">
              <Eye className="mr-1 h-3 w-3" />
              {formatFileSize(video.size)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Element */}
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="h-auto max-h-96 w-full"
            poster={video.metadata?.thumbnail_url}
            autoPlay={autoPlay}
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={video.url} type={video.mime_type} />
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="slider h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #6b7280 ${(currentTime / (duration || 1)) * 100}%, #6b7280 100%)`
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={restart}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => skipTime(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => skipTime(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Volume Control */}
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>

                    {showVolumeSlider && (
                      <div className="absolute bottom-full right-0 mb-2 rounded bg-black/80 p-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-600"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #6b7280 ${volume * 100}%, #6b7280 100%)`
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Metadata */}
        <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2">
          <div>
            <strong>Uploaded:</strong>{' '}
            {new Date(video.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong>Type:</strong> {video.mime_type}
          </div>
          {video.metadata?.resolution && (
            <div>
              <strong>Resolution:</strong> {video.metadata.resolution}
            </div>
          )}
          {video.metadata?.bitrate && (
            <div>
              <strong>Bitrate:</strong> {video.metadata.bitrate}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
