'use client';

import { FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { apiClient } from '@/lib/api';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { ErrorHandler } from '@/lib/error-handler';
import { useVideoCover } from '@/hooks/use-video-cover';
import type { LessonDraft, LessonType } from './useCourseForm';
import { secondsToDuration } from './course-drafts';
import { LESSON_TYPE_BY_KEY } from './lesson-type-config';
import { LessonDocumentSlot } from './lesson-media/lesson-document-slot';
import { LessonCoverSlot } from './lesson-media/lesson-cover-slot';
import { LessonAudioSlot } from './lesson-media/lesson-audio-slot';
import { LessonVideoSlot } from './lesson-media/lesson-video-slot';
import { SlotKey, revokeIfBlob } from './_lib/LessonMedia-helpers';

interface LessonMediaProps {
  lesson: LessonDraft;
  onUpdate: (patch: Partial<LessonDraft>) => void;
}

const ZERO: Record<SlotKey, number> = {
  video: 0,
  audio: 0,
  document: 0,
  cover: 0,
};

const FALSE: Record<SlotKey, boolean> = {
  video: false,
  audio: false,
  document: false,
  cover: false,
};

function toneFor(type: LessonType): string {
  return LESSON_TYPE_BY_KEY[type]?.dropzoneClass ?? LESSON_TYPE_BY_KEY.VIDEO.dropzoneClass;
}

export function LessonMedia({ lesson, onUpdate }: LessonMediaProps) {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const { onCoverPicked, onVideoAttached } = useVideoCover();
  const [progress, setProgress] = useState<Record<SlotKey, number>>(ZERO);
  const [uploading, setUploading] = useState<Record<SlotKey, boolean>>(FALSE);
  const [securing, setSecuring] = useState(false);
  const abortRefs = useRef<Record<SlotKey, AbortController | null>>({
    video: null,
    audio: null,
    document: null,
    cover: null,
  });
  // Keep blob URLs so we can revoke them after the server URL replaces them.
  const blobRefs = useRef<Record<SlotKey, string | null>>({
    video: null,
    audio: null,
    document: null,
    cover: null,
  });

  useEffect(() => {
    return () => {
      revokeIfBlob(blobRefs.current.video ?? undefined);
      revokeIfBlob(blobRefs.current.audio ?? undefined);
      revokeIfBlob(blobRefs.current.cover ?? undefined);
    };
  }, []);

  const type = lesson.lesson_type;
  const showVideo = type === 'VIDEO';
  const showAudio = type === 'AUDIO';
  // Every lesson except a live one may carry an attachment: slides next to a
  // video, a worksheet next to a reading. The student player shows it either way.
  const showDocument = type !== 'LIVE';
  const showCover = showVideo || showAudio;
  const tone = toneFor(type);
  const DocIcon = LESSON_TYPE_BY_KEY[type]?.Icon ?? FileText;

  async function runUpload(
    key: SlotKey,
    uploader: (abort: AbortController, onProgress: (n: number) => void) => Promise<unknown>,
    apply: (data: Record<string, unknown>) => void,
  ) {
    const abort = new AbortController();
    abortRefs.current[key] = abort;
    setUploading((p) => ({ ...p, [key]: true }));
    setProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const result = (await uploader(abort, (n) =>
        setProgress((p) => ({ ...p, [key]: n })),
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

  const PREVIEW_FIELD: Record<'video' | 'audio' | 'cover', keyof LessonDraft> = {
    video: 'videoPreviewUrl',
    audio: 'audioPreviewUrl',
    cover: 'coverPreviewUrl',
  };

  function startLocalPreview(key: 'video' | 'audio' | 'cover', file: File) {
    revokeIfBlob(blobRefs.current[key] ?? undefined);
    const blobUrl = URL.createObjectURL(file);
    blobRefs.current[key] = blobUrl;
    onUpdate({ [PREVIEW_FIELD[key]]: blobUrl });
    return blobUrl;
  }

  function replacePreview(key: 'video' | 'audio' | 'cover', patch: Partial<LessonDraft>) {
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

  // Uploads default to secure (PENDING → the cron worker converts them within
  // a minute). Only a legacy video migrated in as SKIPPED, or one whose
  // conversion errored out (FAILED), ever needs this manual nudge.
  const needsSecuring =
    lesson.video_id && (lesson.videoHlsStatus === 'SKIPPED' || lesson.videoHlsStatus === 'FAILED');

  async function secureVideo() {
    if (!lesson.video_id) return;
    setSecuring(true);
    try {
      const result = await apiClient.secureVideo(lesson.video_id);
      onUpdate({
        videoHlsStatus: result?.hls_status as LessonDraft['videoHlsStatus'],
      });
      toast.success(t('courses.videoSecuringQueued'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setSecuring(false);
    }
  }

  return (
    <div className={cn('grid gap-3', showCover && 'md:grid-cols-2')}>
      {showVideo && (
        <LessonVideoSlot
          abortRefs={abortRefs}
          blobRefs={blobRefs}
          handleMediaMetadata={handleMediaMetadata}
          lesson={lesson}
          needsSecuring={needsSecuring}
          onUpdate={onUpdate}
          onVideoAttached={onVideoAttached}
          percentLabel={percentLabel}
          progress={progress}
          replacePreview={replacePreview}
          runUpload={runUpload}
          secureVideo={secureVideo}
          securing={securing}
          startLocalPreview={startLocalPreview}
          tone={tone}
          uploading={uploading}
        />
      )}

      {showAudio && (
        <LessonAudioSlot
          abortRefs={abortRefs}
          blobRefs={blobRefs}
          handleMediaMetadata={handleMediaMetadata}
          lesson={lesson}
          onUpdate={onUpdate}
          percentLabel={percentLabel}
          progress={progress}
          replacePreview={replacePreview}
          runUpload={runUpload}
          startLocalPreview={startLocalPreview}
          tone={tone}
          uploading={uploading}
        />
      )}

      {showCover && (
        <LessonCoverSlot
          abortRefs={abortRefs}
          blobRefs={blobRefs}
          lesson={lesson}
          onCoverPicked={onCoverPicked}
          onUpdate={onUpdate}
          percentLabel={percentLabel}
          progress={progress}
          replacePreview={replacePreview}
          runUpload={runUpload}
          startLocalPreview={startLocalPreview}
          tone={tone}
          uploading={uploading}
        />
      )}

      {showDocument && (
        <LessonDocumentSlot
          DocIcon={DocIcon}
          abortRefs={abortRefs}
          documentPreviewUrl={documentPreviewUrl}
          lesson={lesson}
          onUpdate={onUpdate}
          percentLabel={percentLabel}
          progress={progress}
          runUpload={runUpload}
          tone={tone}
          uploading={uploading}
        />
      )}
    </div>
  );
}
