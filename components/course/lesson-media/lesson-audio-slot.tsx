'use client';

import { Mic, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import type { LessonDraft } from '../useCourseForm';
import { DEFAULT_DURATION } from '../course-drafts';
import { LESSON_MEDIA_SLOT_CLASS } from './shared';
import { UploadSlot } from './upload-slot';
import type { RefObject } from 'react';
import { SlotKey, revokeIfBlob } from '../_lib/LessonMedia-helpers';

export function LessonAudioSlot({
  abortRefs,
  blobRefs,
  handleMediaMetadata,
  lesson,
  onUpdate,
  percentLabel,
  progress,
  replacePreview,
  runUpload,
  startLocalPreview,
  tone,
  uploading,
}: {
  abortRefs: RefObject<Record<SlotKey, AbortController | null>>;
  blobRefs: RefObject<Record<SlotKey, string | null>>;
  handleMediaMetadata: (event: React.SyntheticEvent<HTMLMediaElement>) => void;
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
  percentLabel: (value: number) => string;
  progress: Record<SlotKey, number>;
  replacePreview: (key: 'video' | 'audio' | 'cover', patch: Partial<LessonDraft>) => void;
  runUpload: (
    key: SlotKey,
    uploader: (abort: AbortController, onProgress: (n: number) => void) => Promise<unknown>,
    apply: (data: Record<string, unknown>) => void,
  ) => Promise<void>;
  startLocalPreview: (key: 'video' | 'audio' | 'cover', file: File) => string;
  tone: string;
  uploading: Record<SlotKey, boolean>;
}) {
  const { t } = useTranslation();
  return (
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
            apiClient.uploadAudio(file, { title: lesson.title || file.name }, onP, abort),
          (data) => {
            const url =
              (data.publicUrl as string) ||
              `${getBrowserApiBaseUrl()}/audios/fetch-audio-by-id/${data.id}`;
            replacePreview('audio', {
              audio_id: String(data.id),
              audioPreviewUrl: url,
            });
          },
        );
      }}
      filled={
        lesson.audioPreviewUrl ? (
          <div
            className={cn(
              'relative flex shrink-0 flex-col items-center justify-center gap-2 rounded-lg border px-3',
              LESSON_MEDIA_SLOT_CLASS,
              tone,
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
              <span className="text-[10px] opacity-70">{percentLabel(progress.audio)}</span>
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
                  duration: DEFAULT_DURATION,
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
  );
}
