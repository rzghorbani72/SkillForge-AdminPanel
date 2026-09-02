'use client';

import React, { useState } from 'react';
import { Lesson } from '@/types/api';
import { apiClient } from '@/lib/api';
import {
  Video,
  AudioLines,
  FileText,
  Image as ImageIcon,
  Play,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';

interface LessonMediaPreviewProps {
  lesson: Lesson;
  className?: string;
}

const LessonMediaPreview: React.FC<LessonMediaPreviewProps> = ({
  lesson,
  className
}) => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<
    'video' | 'audio' | 'document' | 'image' | null
  >(null);

  const hasVideo = !!lesson.video_id;
  const hasAudio = !!lesson.audio_id;
  const hasDocument = !!lesson.document_id;
  const hasImage = !!lesson.image_id;

  // Backend returns capitalized relations with a resolved publicUrl; keep the
  // lowercase aliases only as a defensive fallback.
  const audioRel = lesson.Audio ?? lesson.audio;
  const documentRel = lesson.Document ?? lesson.document;
  const imageRel = lesson.Image ?? lesson.image;

  const hasAnyMedia = hasVideo || hasAudio || hasDocument || hasImage;

  if (!hasAnyMedia) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <span className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          {t('courses.noMediaFiles')}
        </span>
      </div>
    );
  }

  const getVideoUrl = () => {
    if (!lesson.video_id) return '';
    return apiClient.getVideoStreamUrl(lesson.video_id);
  };

  const toAbsolute = (url: string) => {
    if (url.startsWith('http')) return url;
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${getBrowserApiBaseUrl()}${normalizedUrl}`;
  };

  const getAudioUrl = () => {
    if (!lesson.audio_id) return '';
    if (audioRel?.publicUrl) return toAbsolute(audioRel.publicUrl);
    return `${getBrowserApiBaseUrl()}/audios/fetch-audio-by-id/${lesson.audio_id}`;
  };

  const getDocumentUrl = () => {
    if (!lesson.document_id) return '';
    if (documentRel?.publicUrl) return toAbsolute(documentRel.publicUrl);
    return `${getBrowserApiBaseUrl()}/files/download/${lesson.document_id}`;
  };

  const getImageUrl = () => {
    if (!lesson.image_id) return '';
    if (imageRel?.publicUrl) return toAbsolute(imageRel.publicUrl);
    return `${getBrowserApiBaseUrl()}/images/fetch-image-by-id/${lesson.image_id}`;
  };

  const openPreview = (type: 'video' | 'audio' | 'document' | 'image') => {
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewType(null);
  };

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {hasVideo && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('video')}
          >
            <Video className="me-1 h-3 w-3" />
            <span className="text-xs">{t('courses.mediaVideo')}</span>
          </Button>
        )}

        {hasAudio && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('audio')}
          >
            <AudioLines className="me-1 h-3 w-3" />
            <span className="text-xs">{t('courses.mediaAudio')}</span>
          </Button>
        )}

        {hasDocument && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('document')}
          >
            <FileText className="me-1 h-3 w-3" />
            <span className="text-xs">{t('courses.mediaDocument')}</span>
          </Button>
        )}

        {hasImage && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('image')}
          >
            <ImageIcon className="me-1 h-3 w-3" />
            <span className="text-xs">{t('courses.mediaImage')}</span>
          </Button>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {previewType === 'video' && t('courses.videoPreview')}
                {previewType === 'audio' && t('courses.audioPreview')}
                {previewType === 'document' && t('courses.documentPreview')}
                {previewType === 'image' && t('courses.imagePreview')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePreview}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {previewType === 'video' && hasVideo && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <video
                  controls
                  className="h-full w-full"
                  poster={getImageUrl() || undefined}
                >
                  <source src={getVideoUrl()} type="video/mp4" />
                  {t('courses.videoNotSupported')}
                </video>
              </div>
            )}

            {previewType === 'audio' && hasAudio && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-4">
                  <div className="mb-2">
                    <h4 className="font-medium">
                      {audioRel?.title || t('courses.audioFileFallback')}
                    </h4>
                    {audioRel?.duration && (
                      <p className="text-sm text-muted-foreground">
                        {t('courses.duration')}:{' '}
                        {Math.floor(audioRel.duration / 60)}:
                        {String(Math.floor(audioRel.duration % 60)).padStart(
                          2,
                          '0'
                        )}
                      </p>
                    )}
                  </div>
                  <audio controls className="w-full">
                    <source src={getAudioUrl()} type="audio/mpeg" />
                    {t('courses.audioNotSupported')}
                  </audio>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getAudioUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="me-2 h-4 w-4" />
                  {t('courses.downloadAudio')}
                </Button>
              </div>
            )}

            {previewType === 'document' && hasDocument && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-6 text-center">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h4 className="mt-4 font-medium">
                    {documentRel?.title || t('courses.documentFallback')}
                  </h4>
                  {documentRel?.file_size && (
                    <p className="text-sm text-muted-foreground">
                      {t('courses.fileSizeLabel')}:{' '}
                      {t('courses.fileSizeMb', {
                        size: (documentRel.file_size / 1024 / 1024).toFixed(2)
                      })}
                    </p>
                  )}
                  {documentRel?.mime_type && (
                    <p className="text-sm text-muted-foreground">
                      {t('courses.fileTypeLabel')}: {documentRel.mime_type}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getDocumentUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="me-2 h-4 w-4" />
                  {t('courses.downloadDocument')}
                </Button>
              </div>
            )}

            {previewType === 'image' && hasImage && (
              <div className="space-y-4">
                <div className="relative w-full overflow-hidden rounded-lg border">
                  <img
                    src={getImageUrl()}
                    alt={imageRel?.title || t('courses.lessonImageAlt')}
                    className="h-auto w-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        '/placeholder-image.png';
                    }}
                  />
                </div>
                {imageRel?.title && (
                  <p className="text-center text-sm text-muted-foreground">
                    {imageRel.title}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getImageUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="me-2 h-4 w-4" />
                  {t('courses.downloadImage')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LessonMediaPreview;
