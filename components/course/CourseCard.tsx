'use client';

import { BookOpen, Clock, Pencil, Trash2, Users } from 'lucide-react';
import { langApiVersionPath } from '@/lib/api-lang';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StatusPill } from './StatusPill';
import { CourseTypePill } from './course-type-pill';
import { courseHue, formatCourseDurationMinutes, groupSeatPrice } from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick,
}: {
  course: CourseWithRevenue;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const hue = courseHue(course.id);
  const priceVal = course.price ?? (course as any).primary_price ?? 0;
  const isFree = course.is_free ?? (course as any).pricing_type === 'FREE';
  const pricingType = isFree ? 'FREE' : ((course as any).pricing_type ?? 'ONE_TIME');
  const studentsCount =
    (course as any).students_count ??
    course.enrollments_count ??
    (course as any)._count?.Enrollment ??
    0;
  const imageObj = (course as any).Image ?? (course as any).cover;
  const coverUrl =
    imageObj?.publicUrl ||
    (imageObj?.id ? `${langApiVersionPath()}/images/fetch-image-by-id/${imageObj.id}` : null);
  const teacher =
    (course as any).Profile?.display_name ??
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const categoryName = (course as any).Category?.name ?? (course as any).category ?? null;
  const status = course.is_published ? 'PUBLISHED' : ((course as any).status ?? 'DRAFT');
  const isLive = course.course_type === 'LIVE';
  const seatPrice = groupSeatPrice(course);
  const rawDuration = (course as any).duration;
  const durationMinutes =
    typeof rawDuration === 'number'
      ? rawDuration
      : typeof rawDuration === 'string' && /^\d+$/.test(rawDuration.trim())
        ? Number(rawDuration)
        : null;
  const durationLabel = formatCourseDurationMinutes(durationMinutes, formatNumber, t);
  const isMonetaryPrice = isLive
    ? seatPrice !== null && seatPrice > 0
    : pricingType !== 'FREE' && priceVal > 0;
  const priceLabel = isLive
    ? seatPrice === null
      ? t('courses.seatPriceNotSet')
      : seatPrice === 0
        ? t('courses.free')
        : formatNumber(seatPrice)
    : pricingType === 'FREE'
      ? t('courses.free')
      : priceVal > 0
        ? formatNumber(priceVal)
        : '—';

  return (
    <div
      className={cn(
        'group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md',
        onClick && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          background: coverUrl
            ? undefined
            : `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`,
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 opacity-40" style={{ color: `hsl(${hue} 60% 40%)` }} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        {categoryName ? (
          <div className="absolute end-3 top-3 flex max-w-[70%] gap-1.5">
            <span className="truncate rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
              {categoryName}
            </span>
          </div>
        ) : null}
        <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
          <StatusPill status={status} />
          <CourseTypePill type={course.course_type} />
        </div>
        {durationLabel ? (
          <div className="absolute bottom-3 end-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {durationLabel}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug tracking-tight">
          {course.title}
        </div>
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`,
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="truncate text-sm text-muted-foreground">{teacher}</span>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Users className="h-3 w-3" />
                {t('courses.student')}
              </div>
              <div className="truncate text-sm font-semibold tabular-nums">
                {studentsCount > 0 ? formatNumber(studentsCount) : t('courses.beFirstStudent')}
              </div>
            </div>
            <div className="min-w-0 text-end">
              <div className="mb-1 truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {t(isLive ? 'courses.seatPrice' : 'courses.price')}
              </div>
              <div className="flex min-w-0 items-baseline justify-end gap-1">
                <span className="truncate text-lg font-semibold tabular-nums text-primary">
                  {priceLabel}
                </span>
                {isMonetaryPrice ? (
                  <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                    {t('common.toman')}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 gap-1.5"
                  onClick={onEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t('common.edit')}
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('common.delete')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
