'use client';

import { ImageIcon, Loader2, Mic, Video, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { LessonDraft } from './useCourseForm';

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return <div ref={ref} className="h-full bg-primary transition-all" />;
}

interface LessonMediaProps {
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
}

export function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoAbortRef = useRef<AbortController | null>(null);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const abort = new AbortController();
    videoAbortRef.current = abort;
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const result = await apiClient.uploadVideoWithProgress(
        file,
        { title: lesson.title || file.name },
        undefined,
        (p) => setVideoProgress(p),
        abort
      );
      const data = (result as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as string | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ video_id: id, videoPreviewUrl: url });
    } catch (err) {
      if ((err as Error).message !== 'Upload cancelled')
        ErrorHandler.handleApiError(err);
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
      videoAbortRef.current = null;
      e.target.value = '';
    }
  }

  async function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const result = await apiClient.uploadAudio(file, {
        title: lesson.title || file.name
      });
      const data =
        (result as unknown as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as string | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ audio_id: id, audioPreviewUrl: url });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const result = await apiClient.uploadImage(file, {
        title: lesson.title || file.name
      });
      const data = (result as Record<string, unknown>)?.data ?? result;
      const id = (data as Record<string, unknown>)?.id as string | undefined;
      const url =
        ((data as Record<string, unknown>)?.publicUrl as string) ?? '';
      if (id) onUpdate({ cover_id: id, coverPreviewUrl: url });
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonVideo')}
        </Label>
        {lesson.videoPreviewUrl ? (
          <div className="relative overflow-hidden rounded-md border bg-black/5">
            <video
              src={lesson.videoPreviewUrl}
              className="aspect-video w-full rounded-md object-cover"
              controls={false}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-8 w-8 text-white/80 drop-shadow" />
            </div>
            <button
              type="button"
              aria-label={t('courses.removeVideo')}
              onClick={() =>
                onUpdate({ video_id: undefined, videoPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingVideo ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <ProgressBar value={videoProgress} />
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => videoAbortRef.current?.abort()}
            >
              {t('courses.cancelUpload')}
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <Video className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadVideo')}
            </span>
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleVideoChange}
            />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonAudio')}
        </Label>
        {lesson.audioPreviewUrl ? (
          <div className="relative rounded-md border px-3 py-2">
            <audio src={lesson.audioPreviewUrl} controls className="w-full" />
            <button
              type="button"
              aria-label={t('courses.removeAudio')}
              onClick={() =>
                onUpdate({ audio_id: undefined, audioPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingAudio ? (
          <div className="flex items-center justify-center rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadAudio')}
            </span>
            <input
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={handleAudioChange}
            />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {t('courses.lessonCover')}
        </Label>
        {lesson.coverPreviewUrl ? (
          <div className="relative overflow-hidden rounded-md border">
            <img
              src={lesson.coverPreviewUrl}
              alt={lesson.title}
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              aria-label={t('courses.removeCover')}
              onClick={() =>
                onUpdate({ cover_id: undefined, coverPreviewUrl: undefined })
              }
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : uploadingImage ? (
          <div className="flex items-center justify-center rounded-md border border-dashed p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('courses.uploadImage')}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
