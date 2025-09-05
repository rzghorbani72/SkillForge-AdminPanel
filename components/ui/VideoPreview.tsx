import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPreviewProps {
  preview?: string | null;
  uploadedVideoId?: string | null;
  selectedVideo?: { id: number; url: string; title?: string } | null;
  onRemove?: () => void;
  existingVideoUrl?: string | null;
  existingVideoId?: string | number | null;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderSubtext?: string;
  title?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  // Poster image props
  posterImageUrl?: string | null;
  posterImageId?: string | number | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  preview,
  uploadedVideoId,
  selectedVideo,
  onRemove,
  existingVideoUrl,
  existingVideoId,
  className = '',
  showPlaceholder = true,
  placeholderText = 'No video selected',
  placeholderSubtext = 'Upload a video to preview it here',
  title = 'Video Preview',
  isUploading = false,
  uploadProgress = 0,
  // Poster props
  posterImageUrl,
  posterImageId
}) => {
  // Determine which video to show
  const videoToShow = preview || selectedVideo?.url || existingVideoUrl;

  if (!videoToShow && !showPlaceholder) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {title}
            </h4>
            {onRemove && (videoToShow || uploadedVideoId || selectedVideo) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {videoToShow ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <video
                src={videoToShow}
                controls
                className="h-full w-full object-cover"
                poster={posterImageUrl || undefined}
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="rounded-full bg-white/90 p-2">
                  <Play className="h-6 w-6 text-black" />
                </div>
              </div>
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                  <div className="flex items-center justify-center text-sm text-white">
                    <span>Uploading video...</span>
                  </div>
                </div>
              )}
            </div>
          ) : showPlaceholder ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              <div className="text-center">
                <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {placeholderText}
                </p>
                <p className="text-xs text-muted-foreground/75">
                  {placeholderSubtext}
                </p>
              </div>
            </div>
          ) : null}

          {/* Video Info */}
          {(uploadedVideoId || selectedVideo || existingVideoId) && (
            <div className="space-y-1 text-xs text-muted-foreground">
              {selectedVideo && (
                <div className="flex items-center gap-2">
                  <Video className="h-3 w-3" />
                  <span>{selectedVideo.title || 'Selected Video'}</span>
                </div>
              )}
              {uploadedVideoId && (
                <div className="flex items-center gap-2">
                  <Video className="h-3 w-3" />
                  <span>Video ID: {uploadedVideoId}</span>
                </div>
              )}
              {existingVideoId && !selectedVideo && !uploadedVideoId && (
                <div className="flex items-center gap-2">
                  <Video className="h-3 w-3" />
                  <span>Existing Video ID: {existingVideoId}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPreview;
