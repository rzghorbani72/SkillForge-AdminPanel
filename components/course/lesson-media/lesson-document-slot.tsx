'use client';

import { ExternalLink, X, type LucideIcon } from 'lucide-react';
import Link from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import type { LessonDraft } from '../useCourseForm';
import { UploadSlot } from './upload-slot';
import type { RefObject } from 'react';
import { SlotKey, LESSON_INFO_SLOT_CLASS } from '../_lib/LessonMedia-helpers';

export function LessonDocumentSlot({
  DocIcon,
  abortRefs,
  documentPreviewUrl,
  lesson,
  onUpdate,
  percentLabel,
  progress,
  runUpload,
  tone,
  uploading,
}: {
  DocIcon: LucideIcon;
  abortRefs: RefObject<Record<SlotKey, AbortController | null>>;
  documentPreviewUrl: string | null;
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
  percentLabel: (value: number) => string;
  progress: Record<SlotKey, number>;
  runUpload: (
    key: SlotKey,
    uploader: (abort: AbortController, onProgress: (n: number) => void) => Promise<unknown>,
    apply: (data: Record<string, unknown>) => void,
  ) => Promise<void>;
  tone: string;
  uploading: Record<SlotKey, boolean>;
}) {
  const { t } = useTranslation();
  return (
    <UploadSlot
      label={t('courses.lessonDocument')}
      Icon={DocIcon}
      uploadLabel={t('courses.uploadDocument')}
      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
      toneClass={tone}
      boxClass={LESSON_INFO_SLOT_CLASS}
      uploading={uploading.document && !lesson.documentPreviewName}
      progress={progress.document}
      onCancel={() => abortRefs.current.document?.abort()}
      onSelect={(file) => {
        onUpdate({ documentPreviewName: file.name });
        void runUpload(
          'document',
          (abort, onP) =>
            apiClient.uploadDocument(file, { title: lesson.title || file.name }, onP, abort),
          (data) =>
            onUpdate({
              document_id: String(data.id),
              documentPreviewName: (data.title as string) || file.name,
            }),
        );
      }}
      filled={
        lesson.documentPreviewName || lesson.document_id ? (
          <div
            className={cn(
              'relative flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border px-3 text-center',
              LESSON_INFO_SLOT_CLASS,
              tone,
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
              <span className="text-[10px] opacity-70">{percentLabel(progress.document)}</span>
            )}
            <button
              type="button"
              aria-label={t('courses.removeDocument')}
              onClick={() =>
                onUpdate({
                  document_id: undefined,
                  documentPreviewName: undefined,
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
  );
}
