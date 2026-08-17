'use client';

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import {
  LESSON_TYPE_BY_KEY,
  type LessonTypeOption
} from '@/components/course/lesson-type-config';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { LessonContentViewer } from './lesson-content-viewer';
import type { CourseDetailLesson, CourseDetailSeason } from './types';
import { countLessons } from './types';

const DOCUMENT_TYPE_FALLBACK: LessonTypeOption = {
  type: 'TEXT',
  labelKey: 'courses.lessonDocument',
  Icon: FileText,
  badgeClass:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  chipActiveClass:
    'border-slate-600 bg-slate-600 text-white dark:border-slate-400 dark:bg-slate-500',
  dropzoneClass: '',
  accentClass: ''
};

/**
 * Badge follows what is actually uploaded, not `lesson_type`.
 * A LIVE-typed lesson with a video file must show Video; empty lessons show nothing.
 */
function contentBadgeFor(lesson: CourseDetailLesson): LessonTypeOption | null {
  const hasVideo = !!(lesson.video_id ?? lesson.Video?.id);
  const hasAudio = !!(lesson.audio_id ?? lesson.Audio?.id);
  const hasDocument = !!(lesson.document_id ?? lesson.Document?.id);

  if (hasVideo) return LESSON_TYPE_BY_KEY.VIDEO;
  if (hasAudio) return LESSON_TYPE_BY_KEY.AUDIO;
  if (hasDocument) {
    const typed = lesson.lesson_type;
    if (typed === 'QUIZ' || typed === 'ASSIGNMENT' || typed === 'TEXT') {
      return LESSON_TYPE_BY_KEY[typed];
    }
    return DOCUMENT_TYPE_FALLBACK;
  }

  return null;
}

type CourseCurriculumPreviewProps = {
  seasons: CourseDetailSeason[];
  onManage: () => void;
};

function CurriculumLessonRow({ lesson }: { lesson: CourseDetailLesson }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const typeOption = contentBadgeFor(lesson);
  const TypeIcon = typeOption?.Icon;
  const typeLabel = typeOption ? t(typeOption.labelKey) : null;

  return (
    <li className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-start hover:bg-muted/40"
        aria-expanded={open}
        aria-label={
          open
            ? t('courseDetail.hideLessonContent', { title: lesson.title })
            : t('courseDetail.showLessonContent', { title: lesson.title })
        }
      >
        <span className="shrink-0 text-muted-foreground" aria-hidden>
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          )}
        </span>

        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {lesson.title}
        </span>

        {typeOption && TypeIcon && typeLabel && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
              typeOption.badgeClass
            )}
          >
            <TypeIcon className="h-2.5 w-2.5 shrink-0" aria-hidden />
            {typeLabel}
          </span>
        )}

        {lesson.is_free && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
            <Unlock className="h-2.5 w-2.5" />
            {t('courses.free')}
          </span>
        )}
        {!lesson.is_published && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Lock className="h-2.5 w-2.5" />
            {t('courses.draft')}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t bg-muted/20 px-3 py-3 ps-9">
          <LessonContentViewer lesson={lesson} />
        </div>
      )}
    </li>
  );
}

export function CourseCurriculumPreview({
  seasons,
  onManage
}: CourseCurriculumPreviewProps) {
  const { t } = useTranslation();
  const lessonCount = countLessons(seasons);
  const [openSeasons, setOpenSeasons] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(seasons.map((s) => [s.id, true]))
  );

  function toggleSeason(id: string) {
    setOpenSeasons((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Layers className="h-4 w-4 text-violet-600" />
            {t('courseDetail.curriculum')}
          </CardTitle>
          <CardDescription>
            {t('courseDetail.curriculumSummary', {
              seasons: formatNumber(seasons.length),
              lessons: formatNumber(lessonCount)
            })}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onManage}>
          {t('courseDetail.manageCurriculum')}
        </Button>
      </CardHeader>
      <CardContent>
        {seasons.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
            <Layers className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">{t('courseDetail.noCurriculum')}</p>
            <Button variant="link" size="sm" onClick={onManage}>
              {t('courseDetail.addFirstSeason')}
            </Button>
          </div>
        ) : (
          <ol className="space-y-3">
            {seasons.map((season, index) => {
              const seasonOpen = openSeasons[season.id] !== false;
              return (
                <li key={season.id} className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => toggleSeason(season.id)}
                    className="flex w-full items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 text-start hover:bg-muted/60"
                    aria-expanded={seasonOpen}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-muted-foreground">
                        {seasonOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        )}
                      </span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background text-[11px] font-bold text-muted-foreground">
                        {formatNumber(index + 1)}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {season.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {t('courseDetail.lessonsCount', {
                        count: formatNumber(season.Lesson.length)
                      })}
                    </span>
                  </button>
                  {season.description?.trim() && seasonOpen && (
                    <p className="border-b px-3 py-2 text-xs text-muted-foreground">
                      {season.description}
                    </p>
                  )}
                  {seasonOpen && season.Lesson.length > 0 && (
                    <ul>
                      {season.Lesson.map((lesson) => (
                        <CurriculumLessonRow key={lesson.id} lesson={lesson} />
                      ))}
                    </ul>
                  )}
                  {seasonOpen && season.Lesson.length === 0 && (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                      {t('courseDetail.noLessonsInSeason')}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
