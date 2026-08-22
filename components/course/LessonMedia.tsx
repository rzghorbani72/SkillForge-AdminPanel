'use client';

import {
  ExternalLink,
  FileText,
  Loader2,
  Mic,
  Video,
  X,
  type LucideIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/link';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { ErrorHandler } from '@/lib/error-handler';
import { pickFile } from '@/lib/file-picker';
import { isVideoFileAcceptable } from '@/lib/validate-video-upload';
import { VIDEO_CONSTRAINTS } from '@/constants/video-constraints';
import type { LessonDraft, LessonType } from './useCourseForm';
import { DEFAULT_DURATION, secondsToDuration } from './course-drafts';
import { LESSON_TYPE_BY_KEY } from './lesson-type-config';

type SlotKey = 'video' | 'audio' | 'document';

/** Shared outer size for every type — prevents layout jump on type change. */
export const LESSON_MEDIA_SLOT_CLASS = 'h-[12rem] w-full';

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
  hint?: string;
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
  hint,
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
    <div className="w-full space-y-2">
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
          <span className="max-w-[16rem] text-xs font-medium leading-snug">
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
      {hint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
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

function revokeIfBlob(url: string | undefined) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const [progress, setProgress] = useState<Record<SlotKey, number>>(ZERO);
  const [uploading, setUploading] = useState<Record<SlotKey, boolean>>(FALSE);
  const abortRefs = useRef<Record<SlotKey, AbortController | null>>({
    video: null,
    audio: null,
    document: null
  });
  // Keep blob URLs so we can revoke them after the server URL replaces them.
  const blobRefs = useRef<Record<SlotKey, string | null>>({
    video: null,
    audio: null,
    document: null
  });

  useEffect(() => {
    return () => {
      revokeIfBlob(blobRefs.current.video ?? undefined);
      revokeIfBlob(blobRefs.current.audio ?? undefined);
    };
  }, []);

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

  function startLocalPreview(key: 'video' | 'audio', file: File) {
    revokeIfBlob(blobRefs.current[key] ?? undefined);
    const blobUrl = URL.createObjectURL(file);
    blobRefs.current[key] = blobUrl;
    if (key === 'video') {
      onUpdate({ videoPreviewUrl: blobUrl });
    } else {
      onUpdate({ audioPreviewUrl: blobUrl });
    }
    return blobUrl;
  }

  function replacePreview(key: 'video' | 'audio', patch: Partial<LessonDraft>) {
    const prevBlob = blobRefs.current[key];
    blobRefs.current[key] = null;
    onUpdate(patch);
    // Revoke after React swaps the src so playback does not break mid-frame.
    if (prevBlob) {
      requestAnimationFrame(() => URL.revokeObjectURL(prevBlob));
    }
  }

  /**
   * The file itself is the only trustworthy source for how long a lesson runs,
   * so the player reports its length as soon as the metadata is decoded — for a
   * fresh upload (blob preview) and for an already-saved lesson alike.
   */
  function handleMediaMetadata(event: React.SyntheticEvent<HTMLMediaElement>) {
    const seconds = event.currentTarget.duration;
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const measured = secondsToDuration(seconds);
    if (measured !== lesson.duration) onUpdate({ duration: measured });
  }

  const documentPreviewUrl = lesson.document_id
    ? `${getBrowserApiBaseUrl()}/files/preview/${lesson.document_id}`
    : null;

  return (
    <div className="grid gap-3">
      {showVideo && (
        <UploadSlot
          label={t('courses.lessonVideo')}
          Icon={Video}
          uploadLabel={t('courses.uploadVideo')}
          accept={VIDEO_CONSTRAINTS.ALLOWED_FORMATS.join(',')}
          hint={t('courses.videoUploadSizeLimit')}
          toneClass={tone}
          uploading={uploading.video && !lesson.videoPreviewUrl}
          progress={progress.video}
          onCancel={() => abortRefs.current.video?.abort()}
          onSelect={(file) => {
            void (async () => {
              if (!(await isVideoFileAcceptable(file))) return;

              startLocalPreview('video', file);
              await runUpload(
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
                  replacePreview('video', {
                    video_id: String(data.id),
                    videoPreviewUrl: apiClient.getVideoStreamUrl(
                      String(data.id)
                    )
                  })
              );
            })();
          }}
          filled={
            lesson.videoPreviewUrl ? (
              <div
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-lg border bg-black',
                  LESSON_MEDIA_SLOT_CLASS
                )}
              >
                <video
                  key={lesson.videoPreviewUrl}
                  src={lesson.videoPreviewUrl}
                  className="h-full w-full object-contain"
                  controls
                  preload="metadata"
                  onLoadedMetadata={handleMediaMetadata}
                />
                {uploading.video && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[10px] text-white">
                    {percentLabel(progress.video)}
                  </div>
                )}
                <button
                  type="button"
                  aria-label={t('courses.removeVideo')}
                  onClick={() => {
                    revokeIfBlob(blobRefs.current.video ?? undefined);
                    blobRefs.current.video = null;
                    onUpdate({
                      video_id: undefined,
                      videoPreviewUrl: undefined,
                      duration: DEFAULT_DURATION
                    });
                  }}
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
          uploading={uploading.audio && !lesson.audioPreviewUrl}
          progress={progress.audio}
          onCancel={() => abortRefs.current.audio?.abort()}
          onSelect={(file) => {
            startLocalPreview('audio', file);
            void runUpload(
              'audio',
              (abort, onP) =>
                apiClient.uploadAudio(
                  file,
                  { title: lesson.title || file.name },
                  onP,
                  abort
                ),
              (data) => {
                const url =
                  (data.publicUrl as string) ||
                  `${getBrowserApiBaseUrl()}/audios/fetch-audio-by-id/${data.id}`;
                replacePreview('audio', {
                  audio_id: String(data.id),
                  audioPreviewUrl: url
                });
              }
            );
          }}
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
                  key={lesson.audioPreviewUrl}
                  src={lesson.audioPreviewUrl}
                  controls
                  preload="metadata"
                  onLoadedMetadata={handleMediaMetadata}
                  className="h-8 w-full max-w-[20rem]"
                />
                {uploading.audio && (
                  <span className="text-[10px] opacity-70">
                    {percentLabel(progress.audio)}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={t('courses.removeAudio')}
                  onClick={() => {
                    revokeIfBlob(blobRefs.current.audio ?? undefined);
                    blobRefs.current.audio = null;
                    onUpdate({
                      audio_id: undefined,
                      audioPreviewUrl: undefined,
                      duration: DEFAULT_DURATION
                    });
                  }}
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
          uploading={uploading.document && !lesson.documentPreviewName}
          progress={progress.document}
          onCancel={() => abortRefs.current.document?.abort()}
          onSelect={(file) => {
            onUpdate({ documentPreviewName: file.name });
            void runUpload(
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
                  documentPreviewName: (data.title as string) || file.name
                })
            );
          }}
          filled={
            lesson.documentPreviewName || lesson.document_id ? (
              <div
                className={cn(
                  'relative flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border px-3 text-center',
                  LESSON_MEDIA_SLOT_CLASS,
                  tone
                )}
              >
                <span className="bg-current/10 flex h-9 w-9 items-center justify-center rounded-full">
                  <DocIcon className="h-4 w-4" aria-hidden />
                </span>
                <span className="line-clamp-2 max-w-[18rem] break-all text-xs font-medium leading-snug">
                  {lesson.documentPreviewName ?? t('courses.lessonDocument')}
                </span>
                {documentPreviewUrl && (
                  <Link
                    href={documentPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden />
                    {t('media.openPreview')}
                  </Link>
                )}
                {uploading.document && (
                  <span className="text-[10px] opacity-70">
                    {percentLabel(progress.document)}
                  </span>
                )}
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
