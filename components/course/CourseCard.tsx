'use client';

import { BookOpen, Clock, Pencil, Trash2 } from 'lucide-react';
import { langApiVersionPath } from '@/lib/api-lang';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { StatusPill } from './StatusPill';
import { CourseTypePill } from './course-type-pill';
import {
  courseHue,
  formatCourseDurationMinutes,
  groupSeatPrice,
  pricingTypeLabel
} from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick
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
  const pricingType = isFree
    ? 'FREE'
    : ((course as any).pricing_type ?? 'ONE_TIME');
  const studentsCount =
    (course as any).students_count ??
    course.enrollments_count ??
    (course as any)._count?.Enrollment ??
    0;
  const imageObj = (course as any).Image ?? (course as any).cover;
  const coverUrl =
    imageObj?.publicUrl ||
    (imageObj?.id
      ? `${langApiVersionPath()}/images/fetch-image-by-id/${imageObj.id}`
      : null);
  const teacher =
    (course as any).Profile?.display_name ??
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const categoryName =
    (course as any).Category?.name ?? (course as any).category ?? null;
  const status = course.is_published
    ? 'PUBLISHED'
    : ((course as any).status ?? 'DRAFT');
  // A live course is sold by the seat, so its own price is not what it charges.
  const isLive = course.course_type === 'LIVE';
  const seatPrice = groupSeatPrice(course);
  const rawDuration = (course as any).duration;
  const durationMinutes =
    typeof rawDuration === 'number'
      ? rawDuration
      : typeof rawDuration === 'string' && /^\d+$/.test(rawDuration.trim())
        ? Number(rawDuration)
        : null;
  const durationLabel = formatCourseDurationMinutes(
    durationMinutes,
    formatNumber,
    t
  );

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-border/80${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          background: coverUrl
            ? undefined
            : `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen
              className="h-10 w-10 opacity-40"
              style={{ color: `hsl(${hue} 60% 40%)` }}
            />
          </div>
        )}
        <div className="absolute end-3 top-3 flex max-w-[70%] gap-1.5">
          <span
            className="truncate rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: 'hsl(var(--foreground))'
            }}
          >
            {categoryName ?? pricingTypeLabel(pricingType, t)}
          </span>
        </div>
        <div className="absolute start-3 top-3 flex items-center gap-1.5">
          <StatusPill status={status} />
          <CourseTypePill type={course.course_type} />
        </div>
        {durationLabel ? (
          <div
            className="absolute bottom-3 end-3 flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-white backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <Clock className="h-2.5 w-2.5" />
            {durationLabel}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 line-clamp-2 min-h-[2.5rem] text-[14.5px] font-semibold leading-snug">
          {course.title}
        </div>
        <div className="mb-3 flex min-w-0 items-center gap-1.5">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="truncate text-[12px] text-muted-foreground">
            {teacher}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="min-w-0">
              <div className="mb-0.5 truncate text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {t('courses.student')}
              </div>
              <div className="truncate text-[13px] font-semibold">
                {studentsCount > 0
                  ? formatNumber(studentsCount)
                  : t('courses.beFirstStudent')}
              </div>
            </div>
            <div className="min-w-0 text-end">
              <div className="mb-0.5 truncate text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {t(isLive ? 'courses.seatPrice' : 'courses.price')}
              </div>
              <div className="truncate text-[13px] font-semibold text-primary">
                {isLive
                  ? seatPrice === null
                    ? t('courses.seatPriceNotSet')
                    : seatPrice === 0
                      ? t('courses.free')
                      : formatNumber(seatPrice)
                  : pricingType === 'FREE'
                    ? t('courses.free')
                    : priceVal > 0
                      ? formatNumber(priceVal)
                      : '—'}
              </div>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div
              className="mt-3 flex gap-2 border-t border-border/50 pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t('common.edit')}
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('common.delete')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
