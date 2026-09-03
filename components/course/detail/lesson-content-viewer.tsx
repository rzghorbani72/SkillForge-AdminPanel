'use client';

import { FileText } from 'lucide-react';
import Link from '@/components/ui/link';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { SecureVideoPlayer } from '@/components/media/secure-video-player';
import type { CourseDetailLesson } from './types';

function toAbsolute(url: string): string {
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${getBrowserApiBaseUrl()}${normalized}`;
}

type LessonContentViewerProps = {
  lesson: CourseDetailLesson;
};

/**
 * Inline play/view for a lesson's attached media on the course overview.
 * Uses stream/preview endpoints so managers can check content without opening
 * the dedicated lesson page.
 */
export function LessonContentViewer({ lesson }: LessonContentViewerProps) {
  const { t } = useTranslation();

  const videoId = lesson.video_id ?? lesson.Video?.id ?? null;
  const audioId = lesson.audio_id ?? lesson.Audio?.id ?? null;
  const documentId = lesson.document_id ?? lesson.Document?.id ?? null;
  const description = lesson.description?.trim() || lesson.content?.trim();

  const audioUrl = audioId
    ? lesson.Audio?.publicUrl
      ? toAbsolute(lesson.Audio.publicUrl)
      : `${getBrowserApiBaseUrl()}/audios/fetch-audio-by-id/${audioId}`
    : null;
  const documentPreviewUrl = documentId
    ? `${getBrowserApiBaseUrl()}/files/preview/${documentId}`
    : null;

  const hasMedia = !!(videoId || audioUrl || documentPreviewUrl);
  if (!description && !hasMedia) {
    return (
      <p className="text-xs text-muted-foreground">
        {t('courseDetail.noLessonContent')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {videoId && (
        <SecureVideoPlayer
          key={videoId}
          videoId={videoId}
          title={lesson.title}
          className="max-h-72 border"
        />
      )}

      {audioUrl && (
        <div className="rounded-lg border bg-muted/40 p-3">
          {lesson.Audio?.title && (
            <p className="mb-2 truncate text-xs font-medium">
              {lesson.Audio.title}
            </p>
          )}
          <audio key={audioUrl} src={audioUrl} controls className="w-full" />
        </div>
      )}

      {documentPreviewUrl && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {lesson.Document?.title ?? t('courses.lessonDocument')}
          </span>
          <Link
            href={documentPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm text-primary underline"
          >
            {t('media.openPreview')}
          </Link>
        </div>
      )}
    </div>
  );
}
