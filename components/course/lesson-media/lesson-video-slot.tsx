'use client';

import { Loader2, ShieldCheck, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { isVideoFileAcceptable } from '@/lib/validate-video-upload';
import { VIDEO_CONSTRAINTS } from '@/constants/video-constraints';
import type { LessonDraft } from '../useCourseForm';
import { DEFAULT_DURATION } from '../course-drafts';
import { SecureVideoPlayer } from '@/components/media/secure-video-player';
import { LESSON_MEDIA_SLOT_CLASS } from './shared';
import { UploadSlot } from './upload-slot';
import type { RefObject } from 'react';
import { SlotKey, revokeIfBlob } from '../_lib/LessonMedia-helpers';

export function LessonVideoSlot({
  abortRefs,
  blobRefs,
  handleMediaMetadata,
  lesson,
  needsSecuring,
  onUpdate,
  onVideoAttached,
  percentLabel,
  progress,
  replacePreview,
  runUpload,
  secureVideo,
  securing,
  startLocalPreview,
  tone,
  uploading,
}: {
  abortRefs: RefObject<Record<SlotKey, AbortController | null>>;
  blobRefs: RefObject<Record<SlotKey, string | null>>;
  handleMediaMetadata: (event: React.SyntheticEvent<HTMLMediaElement>) => void;
  lesson: LessonDraft;
  needsSecuring: boolean | '' | undefined;
  onUpdate: (patch: Partial<LessonDraft>) => void;
  onVideoAttached: (videoId: string) => void;
  percentLabel: (value: number) => string;
  progress: Record<SlotKey, number>;
  replacePreview: (key: 'video' | 'audio' | 'cover', patch: Partial<LessonDraft>) => void;
  runUpload: (
    key: SlotKey,
    uploader: (abort: AbortController, onProgress: (n: number) => void) => Promise<unknown>,
    apply: (data: Record<string, unknown>) => void,
  ) => Promise<void>;
  secureVideo: () => Promise<void>;
  securing: boolean;
  startLocalPreview: (key: 'video' | 'audio' | 'cover', file: File) => string;
  tone: string;
  uploading: Record<SlotKey, boolean>;
}) {
  const { t } = useTranslation();
  return (
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
                abort,
              ),
            (data) => {
              onVideoAttached(String(data.id));
              replacePreview('video', {
                video_id: String(data.id),
                videoPreviewUrl: apiClient.getVideoStreamUrl(String(data.id)),
              });
            },
          );
        })();
      }}
      filled={
        lesson.videoPreviewUrl ? (
          <div
            className={cn(
              'relative shrink-0 overflow-hidden rounded-lg border bg-black',
              LESSON_MEDIA_SLOT_CLASS,
            )}
          >
            {lesson.videoPreviewUrl.startsWith('blob:') || !lesson.video_id ? (
              // The file the teacher just picked, still on their disk. Kept
              // native because reading its duration is the whole point and
              // there is nothing to protect yet.
              <video
                key={lesson.videoPreviewUrl}
                src={lesson.videoPreviewUrl}
                poster={lesson.coverPreviewUrl}
                className="h-full w-full object-contain"
                controls
                preload="metadata"
                onLoadedMetadata={handleMediaMetadata}
              />
            ) : (
              <SecureVideoPlayer
                key={lesson.video_id}
                videoId={lesson.video_id}
                title={lesson.title}
                fill
                className="h-full w-full"
              />
            )}
            {uploading.video && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[10px] text-white">
                {percentLabel(progress.video)}
              </div>
            )}
            {needsSecuring && !uploading.video && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/70 px-2 py-1.5 text-[11px] text-white">
                <span className="truncate">
                  {securing
                    ? t('courses.videoSecuringInProgress')
                    : lesson.videoHlsStatus === 'FAILED'
                      ? t('courses.videoSecuringFailed')
                      : t('courses.videoNeedsSecuring')}
                </span>
                <button
                  type="button"
                  disabled={securing}
                  onClick={secureVideo}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 font-medium hover:bg-white/25 disabled:opacity-60"
                >
                  {securing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3 w-3" />
                  )}
                  {t('courses.secureThisVideo')}
                </button>
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
