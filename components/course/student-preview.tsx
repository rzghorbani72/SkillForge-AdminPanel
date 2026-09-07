'use client';

import Image from 'next/image';
import { BookOpen, Globe, Lock, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { renderMarkdown } from '@/lib/markdown';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { toPersianDigits } from '@/lib/phone-utils';
import { secondsToDuration } from './course-drafts';

export type StudentPreviewLesson = {
  key: string;
  title: string;
  isFree: boolean;
  /** Lesson length as mm:ss */
  duration: string;
};

export type StudentPreviewSeason = {
  key: string;
  title: string;
  lessons: StudentPreviewLesson[];
};

export type StudentPreviewCourse = {
  title: string;
  description: string;
  coverUrl: string | null;
  categoryName: string | null;
  published: boolean;
  price: number;
  beforeDiscount: number | null;
  seasons: StudentPreviewSeason[];
  lessonCount: number;
  totalSeconds: number;
};

/**
 * The course exactly as a student meets it on the public site. Used by the
 * builder's last step (from the unsaved draft) and by the course overview
 * (from the saved course), so both show the same thing.
 */
export function CourseStudentPreview({
  course,
  /** Off for a live course: its classes are a timetable, not a lesson tree. */
  showCurriculum = true
}: {
  course: StudentPreviewCourse;
  showCurriculum?: boolean;
}) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatCurrency = useFormatCurrency();

  const localDigits = (value: string) =>
    language === 'fa' ? toPersianDigits(value) : value;
  const length = localDigits(secondsToDuration(course.totalSeconds));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative aspect-[21/9] w-full bg-muted">
          {course.coverUrl ? (
            <Image
              src={course.coverUrl}
              alt={course.title}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            {course.categoryName && (
              <Badge variant="secondary">{course.categoryName}</Badge>
            )}
            <Badge variant={course.published ? 'default' : 'outline'}>
              {course.published ? (
                <Globe className="me-1 h-3 w-3" />
              ) : (
                <Lock className="me-1 h-3 w-3" />
              )}
              {t(
                course.published
                  ? 'courses.wizard.visibilityPublicTitle'
                  : 'courses.wizard.visibilityPrivateTitle'
              )}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {course.title || t('courses.wizard.previewUntitled')}
          </h2>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-xl font-semibold">
              {course.price === 0
                ? t('courses.offeringFREE')
                : formatCurrency(course.price)}
            </span>
            {course.beforeDiscount !== null &&
              course.beforeDiscount > course.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(course.beforeDiscount)}
                </span>
              )}
          </div>

          {course.description.trim() && (
            <div
              className="prose-description text-sm leading-6 text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(course.description)
              }}
            />
          )}

          <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
            <span>
              {t('courseDetail.lessons')}: {formatNumber(course.lessonCount)}
            </span>
            <span>
              {t('courseDetail.sections', {
                count: formatNumber(course.seasons.length)
              })}
            </span>
            {course.totalSeconds > 0 && (
              <span>
                {t('courses.courseLength')}: {length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {showCurriculum && (
        <Card>
          <CardHeader>
            <CardTitle>{t('courses.seasonsAndLessons')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.seasons.map((season, index) => (
              <div key={season.key} className="rounded-lg border">
                <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
                  {season.title.trim() ||
                    t('courses.seasonNumber', { n: index + 1 })}
                </div>
                <ul className="divide-y">
                  {season.lessons.map((lesson) => (
                    <li
                      key={lesson.key}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      {lesson.isFree ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {lesson.title.trim() ||
                          t('courses.wizard.previewUntitledLesson')}
                      </span>
                      {lesson.isFree && (
                        <Badge variant="secondary" className="text-[11px]">
                          {t('courses.freePreview')}
                        </Badge>
                      )}
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {localDigits(lesson.duration)}
                      </span>
                    </li>
                  ))}
                  {season.lessons.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      {t('courses.wizard.previewEmptySeason')}
                    </li>
                  )}
                </ul>
              </div>
            ))}
            {course.seasons.length === 0 && (
              <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                {t('courses.wizard.previewNoContent')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
