'use client';

import { FileText, ImageIcon, Loader2, Mic, Video, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { LessonDraft } from './useCourseForm';

type SlotKey = 'video' | 'audio' | 'image' | 'document';

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return <div ref={ref} className="h-full bg-primary transition-all" />;
}

interface UploadSlotProps {
  label: string;
  icon: React.ReactNode;
  uploadLabel: string;
  accept: string;
  /** Preview node when a file is attached, otherwise null */
  filled: React.ReactNode | null;
  uploading: boolean;
  progress: number;
  onSelect: (file: File) => void;
  onCancel?: () => void;
}

function UploadSlot({
  label,
  icon,
  uploadLabel,
  accept,
  filled,
  uploading,
  progress,
  onSelect,
  onCancel
}: UploadSlotProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {filled ? (
        filled
      ) : uploading ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <ProgressBar value={progress} />
          </div>
          {onCancel && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={onCancel}
            >
              {t('courses.cancelUpload')}
            </button>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed p-4 transition-colors hover:bg-muted/40">
          {icon}
          <span className="text-xs text-muted-foreground">{uploadLabel}</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(file);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

interface LessonMediaProps {
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
}

const ZERO: Record<SlotKey, number> = {
  video: 0,
  audio: 0,
  image: 0,
  document: 0
};
const FALSE: Record<SlotKey, boolean> = {
  video: false,
  audio: false,
  image: false,
  document: false
};

export function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<Record<SlotKey, number>>(ZERO);
  const [uploading, setUploading] = useState<Record<SlotKey, boolean>>(FALSE);
  const abortRefs = useRef<Record<SlotKey, AbortController | null>>({
    video: null,
    audio: null,
    image: null,
    document: null
  });

  const type = lesson.lesson_type;
  const showVideo = type === 'VIDEO';
  const showAudio = type === 'VIDEO' || type === 'AUDIO';
  const showCover = type === 'VIDEO';
  const showDocument =
    type === 'TEXT' || type === 'QUIZ' || type === 'ASSIGNMENT';

  async function runUpload(
    key: SlotKey,
    uploader: (
      abort: AbortController,
      onProgress: (n: number) => void
    ) => Promise<unknown>,
    apply: (data: Record<string, unknown>) => void
  ) {
    const abort = new AbortController();
    abortRefs.current[key] = abort;
    setUploading((p) => ({ ...p, [key]: true }));
    setProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const result = (await uploader(abort, (n) =>
        setProgress((p) => ({ ...p, [key]: n }))
      )) as Record<string, unknown> | null;
      const data = (result?.data ?? result ?? {}) as Record<string, unknown>;
      if (data.id != null) apply(data);
    } catch (err) {
      if ((err as Error).message !== 'Upload cancelled') {
        ErrorHandler.handleApiError(err);
      }
    } finally {
      setUploading((p) => ({ ...p, [key]: false }));
      setProgress((p) => ({ ...p, [key]: 0 }));
      abortRefs.current[key] = null;
    }
  }

  const colCount =
    (showVideo ? 1 : 0) +
    (showAudio ? 1 : 0) +
    (showCover ? 1 : 0) +
    (showDocument ? 1 : 0);
  const gridClass =
    colCount === 1
      ? 'grid gap-4'
      : colCount === 2
        ? 'grid gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-3';

  return (
    <div className={gridClass}>
      {showVideo && (
        <UploadSlot
          label={t('courses.lessonVideo')}
          icon={<Video className="h-5 w-5 text-muted-foreground" />}
          uploadLabel={t('courses.uploadVideo')}
          accept="video/*"
          uploading={uploading.video}
          progress={progress.video}
          onCancel={() => abortRefs.current.video?.abort()}
          onSelect={(file) =>
            runUpload(
              'video',
              (abort, onP) =>
                apiClient.uploadVideoWithProgress(
                  file,
                  { title: lesson.title || file.name },
                  undefined,
                  onP,
                  abort
                ),
              (data) =>
                onUpdate({
                  video_id: String(data.id),
                  videoPreviewUrl: apiClient.getVideoStreamUrl(String(data.id))
                })
            )
          }
          filled={
            lesson.videoPreviewUrl ? (
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
                    onUpdate({
                      video_id: undefined,
                      videoPreviewUrl: undefined
                    })
                  }
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null
          }
        />
      )}

      {showAudio && (
        <UploadSlot
          label={t('courses.lessonAudio')}
          icon={<Mic className="h-5 w-5 text-muted-foreground" />}
          uploadLabel={t('courses.uploadAudio')}
          accept="audio/*"
          uploading={uploading.audio}
          progress={progress.audio}
          onCancel={() => abortRefs.current.audio?.abort()}
          onSelect={(file) =>
            runUpload(
              'audio',
              (abort, onP) =>
                apiClient.uploadAudio(
                  file,
                  { title: lesson.title || file.name },
                  onP,
                  abort
                ),
              (data) =>
                onUpdate({
                  audio_id: String(data.id),
                  audioPreviewUrl: (data.publicUrl as string) ?? ''
                })
            )
          }
          filled={
            lesson.audioPreviewUrl ? (
              <div className="relative rounded-md border px-3 py-2">
                <audio
                  src={lesson.audioPreviewUrl}
                  controls
                  className="w-full"
                />
                <button
                  type="button"
                  aria-label={t('courses.removeAudio')}
                  onClick={() =>
                    onUpdate({
                      audio_id: undefined,
                      audioPreviewUrl: undefined
                    })
                  }
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null
          }
        />
      )}

      {showCover && (
        <UploadSlot
          label={t('courses.lessonCover')}
          icon={<ImageIcon className="h-5 w-5 text-muted-foreground" />}
          uploadLabel={t('courses.uploadImage')}
          accept="image/*"
          uploading={uploading.image}
          progress={progress.image}
          onSelect={(file) =>
            runUpload(
              'image',
              (abort, onP) =>
                apiClient.uploadImage(
                  file,
                  { title: lesson.title || file.name },
                  onP,
                  abort
                ),
              (data) =>
                onUpdate({
                  cover_id: String(data.id),
                  coverPreviewUrl: (data.publicUrl as string) ?? ''
                })
            )
          }
          filled={
            lesson.coverPreviewUrl ? (
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
                    onUpdate({
                      cover_id: undefined,
                      coverPreviewUrl: undefined
                    })
                  }
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null
          }
        />
      )}

      {showDocument && (
        <UploadSlot
          label={t('courses.lessonDocument')}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          uploadLabel={t('courses.uploadDocument')}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          uploading={uploading.document}
          progress={progress.document}
          onCancel={() => abortRefs.current.document?.abort()}
          onSelect={(file) =>
            runUpload(
              'document',
              (abort, onP) =>
                apiClient.uploadDocument(
                  file,
                  { title: lesson.title || file.name },
                  onP,
                  abort
                ),
              (data) =>
                onUpdate({
                  document_id: String(data.id),
                  documentPreviewName: file.name
                })
            )
          }
          filled={
            lesson.documentPreviewName ? (
              <div className="relative flex items-center gap-2 rounded-md border px-3 py-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">
                  {lesson.documentPreviewName}
                </span>
                <button
                  type="button"
                  aria-label={t('courses.removeDocument')}
                  onClick={() =>
                    onUpdate({
                      document_id: undefined,
                      documentPreviewName: undefined
                    })
                  }
                  className="rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null
          }
        />
      )}
    </div>
  );
}
