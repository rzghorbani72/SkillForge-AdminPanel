'use client';

import {
  FileText,
  Headphones,
  Layers,
  Lock,
  PlayCircle,
  Radio,
  Type,
  Unlock
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseDetailSeason, LessonType } from './types';
import { countLessons } from './types';

const LESSON_ICONS: Record<LessonType, ReactNode> = {
  VIDEO: <PlayCircle className="h-3.5 w-3.5" />,
  AUDIO: <Headphones className="h-3.5 w-3.5" />,
  DOCUMENT: <FileText className="h-3.5 w-3.5" />,
  TEXT: <Type className="h-3.5 w-3.5" />,
  LIVE: <Radio className="h-3.5 w-3.5" />
};

type CourseCurriculumPreviewProps = {
  seasons: CourseDetailSeason[];
  onManage: () => void;
};

export function CourseCurriculumPreview({
  seasons,
  onManage
}: CourseCurriculumPreviewProps) {
  const { t } = useTranslation();
  const lessonCount = countLessons(seasons);

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
            {seasons.map((season, index) => (
              <li key={season.id} className="rounded-lg border">
                <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
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
                </div>
                {season.Lesson.length > 0 && (
                  <ul className="divide-y">
                    {season.Lesson.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        <span className="shrink-0 text-muted-foreground">
                          {LESSON_ICONS[lesson.lesson_type] ?? (
                            <Type className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {lesson.title}
                        </span>
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
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
