'use client';

import Image from 'next/image';
import { BookOpen, Globe, Lock, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategoriesStore } from '@/lib/store';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { toPersianDigits } from '@/lib/phone-utils';
import { secondsToDuration, sumDurationSeconds } from '../course-drafts';
import type { LessonDraft, SeasonDraft } from '../course-drafts';
import type { CourseFormData } from '../schema';

type StepPreviewProps = {
  values: CourseFormData;
  seasons: SeasonDraft[];
  lessons: LessonDraft[];
  coverPreviewUrl: string | null;
};

/**
 * Step 5 — the course as a student meets it, built from the unsaved draft so
 * the manager checks the real thing before it goes live.
 */
export function StepPreview({
  values,
  seasons,
  lessons,
  coverPreviewUrl
}: StepPreviewProps) {
  const { t, language } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatCurrency = useFormatCurrency();
  const { categories } = useCategoriesStore();

  const category = categories.find(
    (c) => c.id.toString() === values.category_id
  );
  const price = Number(values.primary_price || 0);
  const beforeDiscount = Number(values.secondary_price || 0) || null;
  const totalSeconds = sumDurationSeconds(lessons);
  const length =
    language === 'fa'
      ? toPersianDigits(secondsToDuration(totalSeconds))
      : secondsToDuration(totalSeconds);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative aspect-[21/9] w-full bg-muted">
          {coverPreviewUrl ? (
            <Image
              src={coverPreviewUrl}
              alt={values.title}
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
            {category && <Badge variant="secondary">{category.name}</Badge>}
            <Badge variant={values.published ? 'default' : 'outline'}>
              {values.published ? (
                <Globe className="me-1 h-3 w-3" />
              ) : (
                <Lock className="me-1 h-3 w-3" />
              )}
              {t(
                values.published
                  ? 'courses.wizard.visibilityPublicTitle'
                  : 'courses.wizard.visibilityPrivateTitle'
              )}
            </Badge>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {values.title || t('courses.wizard.previewUntitled')}
          </h2>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-xl font-semibold">
              {price === 0 ? t('courses.offeringFREE') : formatCurrency(price)}
            </span>
            {beforeDiscount !== null && beforeDiscount > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(beforeDiscount)}
              </span>
            )}
          </div>

          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {values.description}
          </p>

          <div className="flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
            <span>
              {t('courseDetail.lessons')}: {formatNumber(lessons.length)}
            </span>
            <span>
              {t('courseDetail.sections', {
                count: formatNumber(seasons.length)
              })}
            </span>
            {totalSeconds > 0 && (
              <span>
                {t('courses.courseLength')}: {length}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('courses.seasonsAndLessons')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {seasons.map((season, index) => {
            const seasonLessons = lessons.filter(
              (l) => l.seasonClientKey === season.clientKey
            );
            return (
              <div key={season.clientKey} className="rounded-lg border">
                <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
                  {season.title.trim() ||
                    t('courses.seasonNumber', { n: index + 1 })}
                </div>
                <ul className="divide-y">
                  {seasonLessons.map((lesson) => (
                    <li
                      key={lesson.clientKey}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      {lesson.is_free ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {lesson.title.trim() ||
                          t('courses.wizard.previewUntitledLesson')}
                      </span>
                      {lesson.is_free && (
                        <Badge variant="secondary" className="text-[11px]">
                          {t('courses.freePreview')}
                        </Badge>
                      )}
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {language === 'fa'
                          ? toPersianDigits(lesson.duration)
                          : lesson.duration}
                      </span>
                    </li>
                  ))}
                  {seasonLessons.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      {t('courses.wizard.previewEmptySeason')}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
          {seasons.length === 0 && (
            <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              {t('courses.wizard.previewNoContent')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
