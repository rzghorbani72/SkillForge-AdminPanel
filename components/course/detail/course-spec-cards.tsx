'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { Fact } from './fact-row';
import type { CourseDetail } from './types';

function SpecCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y text-sm">{children}</CardContent>
    </Card>
  );
}

/** What the course is: type, category, who teaches it, and its dates. */
export function CourseIdentityCard({ course }: { course: CourseDetail }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatNumber = useNumberFormat();
  const notSet = <span className="text-muted-foreground">{t('courseDetail.notSet')}</span>;

  return (
    <SpecCard title={t('courses.courseDetails')}>
      <Fact label={t('courses.courseTypeLabel')}>
        {t(course.course_type === 'LIVE' ? 'courses.typeLiveTitle' : 'courses.typeOfflineTitle')}
      </Fact>
      <Fact label={t('courses.category')}>{course.Category?.name ?? notSet}</Fact>
      <Fact label={t('courses.instructor')}>{course.Profile?.display_name ?? notSet}</Fact>
      <Fact label={t('courseDetail.totalStudents')}>
        {formatNumber(course.active_enrollment_count ?? 0)}
      </Fact>
      <Fact label={t('courses.featured')}>
        {t(course.is_featured ? 'common.yes' : 'common.no')}
      </Fact>
      <Fact label={t('courseDetail.createdAt')}>{formatDate(course.created_at)}</Fact>
      <Fact label={t('courseDetail.updatedAt')}>{formatDate(course.updated_at)}</Fact>
    </SpecCard>
  );
}

/** Who may open the course, for how long, and what they get for finishing. */
export function CourseAccessCard({ course }: { course: CourseDetail }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const percentLabel = usePercentLabel();

  return (
    <SpecCard title={t('courseDetail.accessCard')}>
      <Fact label={t('courses.status')}>
        {t(course.is_published ? 'courses.published' : 'courses.draft')}
      </Fact>
      {course.course_type !== 'LIVE' && (
        <Fact label={t('courseDetail.accessDuration')}>
          {course.access_duration_days
            ? t('courseDetail.daysCount', {
                count: formatNumber(course.access_duration_days),
              })
            : t('courseDetail.lifetimeAccess')}
        </Fact>
      )}
      <Fact label={t('courses.secureMode')}>
        {t(course.allow_downloads ? 'common.no' : 'common.yes')}
      </Fact>
      <Fact label={t('courseDetail.certificate')}>
        {t(course.is_certificate ? 'common.yes' : 'common.no')}
      </Fact>
      {course.is_certificate && course.certificate_min_percent != null && (
        <Fact label={t('certificates.passMark')}>
          {percentLabel(course.certificate_min_percent)}
        </Fact>
      )}
    </SpecCard>
  );
}

/** How the course shows up on Google. Empty fields fall back to the course copy. */
export function CourseSearchCard({ course }: { course: CourseDetail }) {
  const { t } = useTranslation();
  const keywords = course.keywords ?? [];
  const fallback = <span className="text-muted-foreground">{t('courseDetail.seoFallback')}</span>;

  return (
    <SpecCard title={t('courses.seo.title')}>
      <Fact label={t('courses.seo.metaTitle')}>{course.meta_title?.trim() || fallback}</Fact>
      <div className="py-2">
        <p className="text-muted-foreground">{t('courses.seo.metaDescription')}</p>
        <p className="mt-1 line-clamp-3 text-sm">{course.meta_description?.trim() || fallback}</p>
      </div>
      <div className="py-2">
        <p className="text-muted-foreground">{t('courses.seo.keywords')}</p>
        {keywords.length === 0 ? (
          <p className="mt-1">{fallback}</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-[11px]">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </SpecCard>
  );
}
