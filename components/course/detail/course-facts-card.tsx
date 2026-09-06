'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/components/course/courseUtils';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import type { TutoringOffer } from '@/types/learning-operations';
import { Fact } from './fact-row';
import type { CourseDetail } from './types';

type CourseFactsCardProps = {
  course: CourseDetail;
  /** A live course sells through tutoring offers, not `course.price`. */
  offers?: TutoringOffer[];
};

/** What this course charges. The rest of its settings live on the overview. */
export function CourseFactsCard({ course, offers = [] }: CourseFactsCardProps) {
  const { t } = useTranslation();
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
      </CardContent>
    </Card>
  );
}
