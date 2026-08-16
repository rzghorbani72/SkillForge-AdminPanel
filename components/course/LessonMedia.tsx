'use client';

import {
  FileText,
  Loader2,
  Mic,
  Video,
  X,
  type LucideIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { pickFile } from '@/lib/file-picker';
import type { LessonDraft, LessonType } from './useCourseForm';
import { LESSON_TYPE_BY_KEY } from './lesson-type-config';

type SlotKey = 'video' | 'audio' | 'document';

/** Shared outer size for every type — prevents layout jump on type change. */
export const LESSON_MEDIA_SLOT_CLASS = 'h-[7.75rem] w-[13.75rem]';

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${value}%`;
  }, [value]);
  return (
    <div ref={ref} className="h-full rounded-full bg-current transition-all" />
  );
}

interface UploadSlotProps {
  label: string;
  Icon: LucideIcon;
  uploadLabel: string;
  accept: string;
  toneClass: string;
  filled: React.ReactNode | null;
  uploading: boolean;
  progress: number;
  onSelect: (file: File) => void;
  onCancel?: () => void;
}

function UploadSlot({
  label,
  Icon,
  uploadLabel,
  accept,
  toneClass,
  filled,
  uploading,
  progress,
  onSelect,
  onCancel
}: UploadSlotProps) {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleActivate(e: React.MouseEvent<HTMLLabelElement>) {
    e.preventDefault();
    const picked = await pickFile(accept);
    if (picked === undefined) {
      inputRef.current?.click();
      return;
    }
    if (picked) onSelect(picked);
  }

  const frameClass = cn(
    'flex shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed px-3 text-center transition-colors',
    LESSON_MEDIA_SLOT_CLASS,
    toneClass
  );

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {filled ? (
        filled
      ) : uploading ? (
        <div className={frameClass} role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-sm font-semibold tabular-nums">
            {percentLabel(progress)}
          </span>
          <div className="bg-current/15 h-1.5 w-24 overflow-hidden rounded-full">
            <ProgressBar value={progress} />
          </div>
          {onCancel && (
            <button
              type="button"
              className="text-[11px] opacity-70 hover:text-destructive hover:opacity-100"
              onClick={onCancel}
            >
              {t('courses.cancelUpload')}
            </button>
          )}
        </div>
      ) : (
        <label
          onClick={handleActivate}
          className={cn(frameClass, 'cursor-pointer')}
        >
          <span className="bg-current/10 flex h-10 w-10 items-center justify-center rounded-full">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="max-w-[11rem] text-xs font-medium leading-snug">
            {uploadLabel}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
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
  document: 0
};
const FALSE: Record<SlotKey, boolean> = {
  video: false,
  audio: false,
  document: false
};

function toneFor(type: LessonType): string {
  return (
    LESSON_TYPE_BY_KEY[type]?.dropzoneClass ??
    LESSON_TYPE_BY_KEY.VIDEO.dropzoneClass
  );
}

export function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<Record<SlotKey, number>>(ZERO);
  const [uploading, setUploading] = useState<Record<SlotKey, boolean>>(FALSE);
  const abortRefs = useRef<Record<SlotKey, AbortController | null>>({
    video: null,
    audio: null,
    document: null
  });

  const type = lesson.lesson_type;
  const showVideo = type === 'VIDEO';
  const showAudio = type === 'AUDIO';
  const showDocument =
    type === 'TEXT' || type === 'QUIZ' || type === 'ASSIGNMENT';
  const tone = toneFor(type);
  const DocIcon = LESSON_TYPE_BY_KEY[type]?.Icon ?? FileText;

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

  return (
    <div className="grid gap-3">
      {showVideo && (
        <UploadSlot
          label={t('courses.lessonVideo')}
          Icon={Video}
          uploadLabel={t('courses.uploadVideo')}
          accept="video/*"
          toneClass={tone}
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
              <div
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-lg border bg-black/5',
                  LESSON_MEDIA_SLOT_CLASS
                )}
              >
                <video
                  src={lesson.videoPreviewUrl}
                  className="h-full w-full object-cover"
                  controls={false}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sky-700 shadow-sm">
                    <Video className="h-5 w-5" aria-hidden />
                  </span>
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
                  className="absolute end-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
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
          Icon={Mic}
          uploadLabel={t('courses.uploadAudio')}
          accept="audio/*"
          toneClass={tone}
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
              <div
                className={cn(
                  'relative flex shrink-0 flex-col items-center justify-center gap-2 rounded-lg border px-3',
                  LESSON_MEDIA_SLOT_CLASS,
                  tone
                )}
              >
                <span className="bg-current/10 flex h-9 w-9 items-center justify-center rounded-full">
                  <Mic className="h-4 w-4" aria-hidden />
                </span>
                <audio
                  src={lesson.audioPreviewUrl}
                  controls
                  className="h-8 w-full max-w-[11.5rem]"
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
                  className="absolute end-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
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
          Icon={DocIcon}
          uploadLabel={t('courses.uploadDocument')}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          toneClass={tone}
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
              <div
                className={cn(
                  'relative flex shrink-0 flex-col items-center justify-center gap-2 rounded-lg border px-3 text-center',
                  LESSON_MEDIA_SLOT_CLASS,
                  tone
                )}
              >
                <span className="bg-current/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <DocIcon className="h-5 w-5" aria-hidden />
                </span>
                <span className="line-clamp-2 max-w-[11rem] break-all text-xs font-medium leading-snug">
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
                  className="absolute end-1.5 top-1.5 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
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
