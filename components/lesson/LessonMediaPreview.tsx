'use client';

import React, { useState } from 'react';
import { Lesson } from '@/types/api';
import { apiClient } from '@/lib/api';
import {
  Video,
  Audio,
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

interface LessonMediaPreviewProps {
  lesson: Lesson;
  className?: string;
}

const LessonMediaPreview: React.FC<LessonMediaPreviewProps> = ({
  lesson,
  className
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<
    'video' | 'audio' | 'document' | 'image' | null
  >(null);

  const hasVideo = !!lesson.video_id;
  const hasAudio = !!lesson.audio_id;
  const hasDocument = !!lesson.document_id;
  const hasImage = !!lesson.image_id;

  const hasAnyMedia = hasVideo || hasAudio || hasDocument || hasImage;

  if (!hasAnyMedia) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <span className="flex items-center">
          <FileText className="mr-1 h-4 w-4" />
          No media files
        </span>
      </div>
    );
  }

  const getVideoUrl = () => {
    if (!lesson.video_id) return '';
    return apiClient.getVideoStreamUrl(lesson.video_id);
  };

  const getAudioUrl = () => {
    if (!lesson.audio_id) return '';
    // If audio relation is loaded, use its URL
    if (lesson.audio?.url) {
      const url = lesson.audio.url;
      if (url.startsWith('http')) return url;
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
        `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      return `${apiBase}${normalizedUrl}`;
    }
    // Otherwise, construct URL from ID
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
      `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
    return `${apiBase}/audios/stream/${lesson.audio_id}`;
  };

  const getDocumentUrl = () => {
    if (!lesson.document_id) return '';
    // If document relation is loaded, use its URL
    if (lesson.document?.url) {
      const url = lesson.document.url;
      if (url.startsWith('http')) return url;
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
        `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      return `${apiBase}${normalizedUrl}`;
    }
    // Otherwise, construct URL from ID
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
      `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
    return `${apiBase}/documents/${lesson.document_id}`;
  };

  const getImageUrl = () => {
    if (!lesson.image_id) return '';
    // If image relation is loaded, use its URL
    if (lesson.image?.url) {
      const url = lesson.image.url;
      if (url.startsWith('http')) return url;
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
        `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
      const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
      return `${apiBase}${normalizedUrl}`;
    }
    // Otherwise, construct URL from ID
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
      `${process.env.NEXT_PUBLIC_HOST || ''}/api`;
    return `${apiBase}/images/${lesson.image_id}`;
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
            <Video className="mr-1 h-3 w-3" />
            <span className="text-xs">Video</span>
          </Button>
        )}

        {hasAudio && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('audio')}
          >
            <Audio className="mr-1 h-3 w-3" />
            <span className="text-xs">Audio</span>
          </Button>
        )}

        {hasDocument && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('document')}
          >
            <FileText className="mr-1 h-3 w-3" />
            <span className="text-xs">Document</span>
          </Button>
        )}

        {hasImage && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => openPreview('image')}
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            <span className="text-xs">Image</span>
          </Button>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {previewType === 'video' && 'Video Preview'}
                {previewType === 'audio' && 'Audio Preview'}
                {previewType === 'document' && 'Document Preview'}
                {previewType === 'image' && 'Image Preview'}
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
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {previewType === 'audio' && hasAudio && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-4">
                  <div className="mb-2">
                    <h4 className="font-medium">
                      {lesson.audio?.title || `Audio File #${lesson.audio_id}`}
                    </h4>
                    {lesson.audio?.duration && (
                      <p className="text-sm text-muted-foreground">
                        Duration: {Math.floor(lesson.audio.duration / 60)}:
                        {String(
                          Math.floor(lesson.audio.duration % 60)
                        ).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <audio controls className="w-full">
                    <source src={getAudioUrl()} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getAudioUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Audio
                </Button>
              </div>
            )}

            {previewType === 'document' && hasDocument && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-6 text-center">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h4 className="mt-4 font-medium">
                    {lesson.document?.title ||
                      `Document #${lesson.document_id}`}
                  </h4>
                  {lesson.document?.file_size && (
                    <p className="text-sm text-muted-foreground">
                      Size:{' '}
                      {(lesson.document.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                  {lesson.document?.mime_type && (
                    <p className="text-sm text-muted-foreground">
                      Type: {lesson.document.mime_type}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getDocumentUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </Button>
              </div>
            )}

            {previewType === 'image' && hasImage && (
              <div className="space-y-4">
                <div className="relative w-full overflow-hidden rounded-lg border">
                  <img
                    src={getImageUrl()}
                    alt={
                      lesson.image?.title || `Lesson image #${lesson.image_id}`
                    }
                    className="h-auto w-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src =
                        '/placeholder-image.png';
                    }}
                  />
                </div>
                {lesson.image?.title && (
                  <p className="text-center text-sm text-muted-foreground">
                    {lesson.image.title}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getImageUrl(), '_blank')}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
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
