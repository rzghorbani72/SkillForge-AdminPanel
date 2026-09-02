'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import type { CourseDetail } from './types';

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-end font-medium">{children}</span>
    </div>
  );
}

type CourseFactsCardProps = {
  course: CourseDetail;
};

export function CourseFactsCard({ course }: CourseFactsCardProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const hasDiscount =
    !course.is_free &&
    course.original_price > 0 &&
    course.original_price > course.price;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('courseDetail.pricingCard')}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y text-sm">
        <Fact label={t('courses.price')}>
          {course.is_free ? (
            <span className="text-emerald-600">{t('courses.free')}</span>
          ) : (
            <span className="text-emerald-600">
              {formatNumber(course.price)} {t('common.toman')}
            </span>
          )}
        </Fact>

        {hasDiscount && (
          <Fact label={t('courseDetail.comparePrice')}>
            <span className="text-muted-foreground line-through">
              {formatNumber(course.original_price)} {t('common.toman')}
            </span>
          </Fact>
        )}

        {course.discount_percent != null && course.discount_percent > 0 && (
          <Fact label={t('courseDetail.discount')}>
            {formatNumber(course.discount_percent)}%
          </Fact>
        )}

        <Fact label={t('courseDetail.certificate')}>
          {course.is_certificate ? t('common.yes') : t('common.no')}
        </Fact>

        <Fact label={t('courseDetail.accessDuration')}>
          {course.access_duration_days
            ? t('courseDetail.daysCount', {
                count: course.access_duration_days
              })
            : t('courseDetail.lifetimeAccess')}
        </Fact>

        <Fact label={t('courseDetail.createdAt')}>
          {formatDate(course.created_at)}
        </Fact>

        <Fact label={t('courseDetail.updatedAt')}>
          {formatDate(course.updated_at)}
        </Fact>
      </CardContent>
    </Card>
  );
}
