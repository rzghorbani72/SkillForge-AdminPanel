'use client';

import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import type { LessonDraft } from '../useCourseForm';
import { IMAGE_ACCEPT } from '@/lib/upload-limits';
import { LESSON_MEDIA_SLOT_CLASS } from './shared';
import { UploadSlot } from './upload-slot';
import type { RefObject } from 'react';
import { SlotKey, revokeIfBlob } from '../_lib/LessonMedia-helpers';

export function LessonCoverSlot({
  abortRefs,
  blobRefs,
  lesson,
  onCoverPicked,
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
  lesson: LessonDraft;
  onCoverPicked: (file: File, videoId?: string | null) => void;
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
      label={t('courses.lessonCover')}
      Icon={ImageIcon}
      uploadLabel={t('courses.uploadCoverImage')}
      accept={IMAGE_ACCEPT}
      hint={t('courses.lessonCoverHint')}
      toneClass={tone}
      uploading={uploading.cover && !lesson.coverPreviewUrl}
      progress={progress.cover}
      onCancel={() => abortRefs.current.cover?.abort()}
      onSelect={(file) => {
        onCoverPicked(file, lesson.video_id);
        startLocalPreview('cover', file);
        void runUpload(
          'cover',
          (abort, onP) =>
            apiClient.uploadImage(file, { title: lesson.title || file.name }, onP, abort),
          (data) => {
            const url = data.publicUrl as string | undefined;
            replacePreview('cover', {
              cover_id: String(data.id),
              coverPreviewUrl: url?.startsWith('http')
                ? url
                : `${getBrowserApiBaseUrl()}/images/fetch-image-by-id/${data.id}`,
            });
          },
        );
      }}
      filled={
        lesson.coverPreviewUrl ? (
          <div
            className={cn(
              'relative shrink-0 overflow-hidden rounded-lg border bg-muted',
              LESSON_MEDIA_SLOT_CLASS,
            )}
          >
            <Image
              key={lesson.coverPreviewUrl}
              src={lesson.coverPreviewUrl}
              alt={t('courses.lessonCover')}
              fill
              sizes="400px"
              className="object-cover"
            />
            {uploading.cover && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[10px] text-white">
                {percentLabel(progress.cover)}
              </div>
            )}
            <button
              type="button"
              aria-label={t('courses.removeCover')}
              onClick={() => {
                revokeIfBlob(blobRefs.current.cover ?? undefined);
                blobRefs.current.cover = null;
                onUpdate({
                  cover_id: undefined,
                  coverPreviewUrl: undefined,
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
