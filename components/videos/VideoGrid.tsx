import { Video } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface VideoGridProps {
  videos: any[];
  onVideoSelect: (video: any) => void;
  getVideoIcon: (type?: string) => React.ReactNode;
  getVideoTypeColor: (type?: string) => string;
  formatDuration: (seconds?: number) => string;
  formatFileSize: (bytes?: number) => string;
  getPosterUrl: (posterUrl: string | null | undefined) => string | null;
  isOwnMedia: (video: any) => boolean;
}

export function VideoGrid({
  videos,
  onVideoSelect,
  getVideoIcon,
  getVideoTypeColor,
  formatDuration,
  formatFileSize,
  getPosterUrl,
  isOwnMedia
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <EmptyState
        icon={<Video className="h-12 w-12" />}
        title="No videos found"
        description="Upload your first video to get started."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div key={video.id}>
          {/* This would be the VideoCard component, but we'll keep it simple for now */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.description}</p>
            <button
              onClick={() => onVideoSelect(video)}
              className="mt-2 rounded bg-blue-500 px-3 py-1 text-white"
            >
              Play Video
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
