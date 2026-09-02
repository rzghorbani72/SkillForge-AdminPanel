'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import type { TutoringOffer } from '@/types/learning-operations';
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
  /** A live course sells through tutoring offers, not `course.price`. */
  offers?: TutoringOffer[];
};

export function CourseFactsCard({ course, offers = [] }: CourseFactsCardProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const percentLabel = usePercentLabel();

  const isLive = course.course_type === 'LIVE';
  const priceOf = (kind: 'GROUP' | 'SOLO') =>
    offers.find((offer) => offer.kind === kind)?.price ?? null;
  const money = (value: number) =>
    value > 0
      ? `${formatNumber(value)} ${t('common.toman')}`
      : t('courses.free');

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
        {isLive ? (
          <>
            <Fact label={t('courses.live.groupPrice')}>
              <span className="text-emerald-600">
                {priceOf('GROUP') === null
                  ? t('courseDetail.priceNotSet')
                  : money(priceOf('GROUP') as number)}
              </span>
            </Fact>
            <Fact label={t('courses.live.soloPrice')}>
              {priceOf('SOLO') === null ? (
                <span className="text-muted-foreground">
                  {t('courseDetail.notSelling')}
                </span>
              ) : (
                <span className="text-emerald-600">
                  {money(priceOf('SOLO') as number)}
                </span>
              )}
            </Fact>
          </>
        ) : (
          <Fact label={t('courses.price')}>
            {course.is_free ? (
              <span className="text-emerald-600">{t('courses.free')}</span>
            ) : (
              <span className="text-emerald-600">
                {formatNumber(course.price)} {t('common.toman')}
              </span>
            )}
          </Fact>
        )}

        {!isLive && hasDiscount && (
          <Fact label={t('courseDetail.comparePrice')}>
            <span className="text-muted-foreground line-through">
              {formatNumber(course.original_price)} {t('common.toman')}
            </span>
          </Fact>
        )}

        {!isLive &&
          course.discount_percent != null &&
          course.discount_percent > 0 && (
            <Fact label={t('courseDetail.discount')}>
              {percentLabel(course.discount_percent)}
            </Fact>
          )}

        <Fact label={t('courseDetail.certificate')}>
          {course.is_certificate ? t('common.yes') : t('common.no')}
        </Fact>

        {!isLive && (
          <Fact label={t('courseDetail.accessDuration')}>
            {course.access_duration_days
              ? t('courseDetail.daysCount', {
                  count: formatNumber(course.access_duration_days)
                })
              : t('courseDetail.lifetimeAccess')}
          </Fact>
        )}

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
