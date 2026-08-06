'use client';

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
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';

interface VideoUploadPreviewProps {
  title?: string;
  description?: string;
  onSuccess?: (video: { id: number; url: string; title?: string }) => void;
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
  onPosterSuccess?: (image: { id: string; url: string }) => void;
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
  placeholderText,
  placeholderSubtext,
  uploadButtonText,
  selectButtonText,
  showVideoSelection = true,
  selectedVideoId,
  disabled = false,
  allowPosterUpload = false,
  // Poster props
  posterImageId,
  posterImageUrl,
  onPosterSuccess
}) => {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: number;
    publicUrl: string;
    title?: string;
  } | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const videoUpload = useVideoUpload({
    title,
    description,
    onSuccess: (videoId) => {
      onSuccess?.({ id: parseInt(videoId), url: '' });
    },
    onError: (error) => {
      setFileInputKey((k) => k + 1);
      onError?.(error);
    },
    onCancel
  });

  const handleVideoSelect = (video: {
    id: number;
    publicUrl: string;
    title?: string;
  }) => {
    setSelectedVideo(video);
    onSuccess?.({
      id: video.id,
      url: video.publicUrl,
      title: video.title
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Video File Input */}
      <div className="space-y-2">
        <Input
          key={fileInputKey}
          id="video-upload"
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={videoUpload.handleVideoFileChange}
          className="cursor-pointer"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          {t('media.videoFormatsHint')}
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
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t('common.uploading')}
            </>
          ) : videoUpload.hasVideoFile ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {uploadButtonText ?? t('media.uploadVideo')}
            </>
          ) : (
            (selectButtonText ?? t('media.selectVideoFirst'))
          )}
        </Button>

        {showVideoSelection && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="px-4"
              title={t('media.selectFromLibraryHint')}
              onClick={() => setIsSelectionDialogOpen(true)}
            >
              <Library className="me-2 h-4 w-4" />
              {t('media.selectFromLibrary')}
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
            <X className="me-2 h-4 w-4" />
            {t('common.cancel')}
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {videoUpload.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {videoUpload.uploadProgress === 100
                ? t('media.processingVideo')
                : t('media.uploadingVideo')}
            </span>
            <span className="font-medium">
              {percentLabel(videoUpload.uploadProgress)}
            </span>
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
        placeholderText={placeholderText ?? t('media.noVideoSelected')}
        placeholderSubtext={placeholderSubtext ?? t('media.videoPreviewHint')}
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
            {t('media.videoPoster')}
          </h4>
          <ImageUploadPreview
            title={title || t('media.videoPoster')}
            description={description || t('media.videoPoster')}
            onSuccess={(image) => {
              onPosterSuccess?.(image);
            }}
            selectedImageId={posterImageId ? String(posterImageId) : null}
            alt={t('media.videoPoster')}
            placeholderText={t('media.noPosterSelected')}
            placeholderSubtext={t('media.dropImageHint')}
            onError={onError}
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
