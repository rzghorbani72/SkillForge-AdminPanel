import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, X, Library } from 'lucide-react';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import VideoPreview from './VideoPreview';
import VideoSelectionDialog from './VideoSelectionDialog';
import ProgressBar from './ProgressBar';
import { cn } from '@/lib/utils';
import ImageUploadPreview from './ImageUploadPreview';

interface VideoUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (video: { id: number; url: string }) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  existingVideoUrl?: string | null;
  existingVideoId?: string | number | null;
  alt?: string;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
  placeholderSubtext?: string;
  uploadButtonText?: string;
  selectButtonText?: string;
  showVideoSelection?: boolean;
  selectedVideoId?: string | null;
  disabled?: boolean;
  allowPosterUpload?: boolean;
  // Poster/cover image props
  posterImageId?: string | number | null;
  posterImageUrl?: string | null;
  onPosterSuccess?: (image: { id: number; url: string }) => void;
  onPosterRemove?: () => void;
}

const VideoUploadPreview: React.FC<VideoUploadPreviewProps> = ({
  title = 'Video Upload',
  description = 'Upload a video file',
  onSuccess,
  onError,
  onCancel,
  existingVideoUrl,
  existingVideoId,
  className = '',
  showPlaceholder = true,
  placeholderText = 'No video selected',
  placeholderSubtext = 'Upload a video to preview it here',
  uploadButtonText = 'Upload Video',
  selectButtonText = 'Select a video first',
  showVideoSelection = true,
  selectedVideoId,
  disabled = false,
  allowPosterUpload = false,
  // Poster props
  posterImageId,
  posterImageUrl,
  onPosterSuccess
}) => {
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: number;
    url: string;
    title?: string;
  } | null>(null);

  const videoUpload = useVideoUpload({
    title,
    description,
    onSuccess: (videoId) => {
      // Handle uploaded video
      onSuccess?.({ id: parseInt(videoId), url: '' });
    },
    onError,
    onCancel
  });

  const handleVideoSelect = (video: {
    id: number;
    url: string;
    title?: string;
  }) => {
    setSelectedVideo(video);
    onSuccess?.(video);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Video File Input */}
      <div className="space-y-2">
        <Input
          id="video-upload"
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={videoUpload.handleVideoFileChange}
          className="cursor-pointer"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Supported formats: MP4, WebM, OGG (Max 500MB)
        </p>
      </div>

      {/* Upload, Select, and Cancel Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={videoUpload.uploadVideo}
          disabled={!videoUpload.canUpload || disabled}
          className="flex-1"
        >
          {videoUpload.isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : videoUpload.hasVideoFile ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {uploadButtonText}
            </>
          ) : (
            selectButtonText
          )}
        </Button>

        {showVideoSelection && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="px-4"
              title="Select from existing videos to avoid duplicates"
              onClick={() => setIsSelectionDialogOpen(true)}
            >
              <Library className="mr-2 h-4 w-4" />
              Select from Library
            </Button>
            <VideoSelectionDialog
              onSelect={handleVideoSelect}
              selectedVideoId={selectedVideoId}
              open={isSelectionDialogOpen}
              onOpenChange={setIsSelectionDialogOpen}
            />
          </>
        )}

        {videoUpload.canCancel && (
          <Button
            type="button"
            variant="destructive"
            onClick={videoUpload.cancelUpload}
            className="px-4"
            disabled={disabled}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {videoUpload.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {videoUpload.uploadProgress === 100
                ? 'Processing video...'
                : 'Uploading video...'}
            </span>
            <span className="font-medium">{videoUpload.uploadProgress}%</span>
          </div>
          <ProgressBar
            progress={videoUpload.uploadProgress}
            size="md"
            variant={videoUpload.uploadProgress === 100 ? 'success' : 'default'}
            showPercentage={false}
          />
        </div>
      )}

      {/* Video Preview */}
      <VideoPreview
        preview={videoUpload.preview}
        uploadedVideoId={videoUpload.uploadedVideoId || selectedVideoId}
        selectedVideo={selectedVideo}
        onRemove={() => {
          videoUpload.removeFiles();
          setSelectedVideo(null);
          if (selectedVideoId) {
            onSuccess?.({ id: 0, url: '' });
          }
        }}
        existingVideoUrl={existingVideoUrl}
        existingVideoId={existingVideoId}
        className={className}
        showPlaceholder={showPlaceholder}
        placeholderText={placeholderText}
        placeholderSubtext={placeholderSubtext}
        title={title}
        isUploading={videoUpload.isUploading}
        uploadProgress={videoUpload.uploadProgress}
        posterImageUrl={posterImageUrl}
        posterImageId={posterImageId}
      />

      {/* Poster Image Preview */}
      {allowPosterUpload && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Video Poster
          </h4>
          <ImageUploadPreview
            title={title || 'Video Poster'}
            description={description || 'Video poster image'}
            onSuccess={(image) => {
              onPosterSuccess?.(image);
            }}
            selectedImageId={posterImageId ? String(posterImageId) : null}
            alt="Video poster preview"
            placeholderText="No poster selected"
            placeholderSubtext="Upload a poster image for this video"
            uploadButtonText="Upload Poster"
            selectButtonText="Select a poster first"
            onError={onError}
            onCancel={onCancel}
            existingImageUrl={posterImageUrl}
            existingImageId={posterImageId}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default VideoUploadPreview;
