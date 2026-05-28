'use client';

import { BookOpen, Clock, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { StatusPill } from './StatusPill';
import { courseHue, formatNumber, pricingTypeLabel } from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

export function CourseCard({
  course,
  onOpen
}: {
  course: CourseWithRevenue;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const hue = courseHue(course.id);
  const priceVal = (course as any).primary_price ?? 0;
  const pricingType = (course as any).pricing_type ?? 'ONE_TIME';
  const studentsCount = course.enrollments_count ?? 0;
  const coverUrl =
    (course as any).cover?.url || (course as any).cover?.file_path || null;
  const teacher =
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const rating = (course as any).rating ?? 0;

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80"
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
        <div className="absolute end-3 top-3 flex gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: 'hsl(var(--foreground))'
            }}
          >
            {(course as any).category ?? pricingTypeLabel(pricingType, t)}
          </span>
        </div>
        <div className="absolute start-3 top-3">
          <StatusPill status={(course as any).status ?? 'DRAFT'} />
        </div>
        <div
          className="absolute bottom-3 end-3 flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <Clock className="h-2.5 w-2.5" />
          {(course as any).duration ?? '—'}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 text-[14.5px] font-semibold leading-snug">
          {course.title}
        </div>
        <div className="mb-3 flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="text-[12px] text-muted-foreground">{teacher}</span>
          {rating > 0 && (
            <span className="ms-auto flex items-center gap-0.5 text-[11.5px] text-amber-600">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div>
            <div className="mb-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              {t('courses.student')}
            </div>
            <div className="font-mono text-[13px] font-semibold">
              {formatNumber(studentsCount)}
            </div>
          </div>
          <div className="text-end">
            <div className="mb-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
              {t('courses.price')}
            </div>
            <div className="font-mono text-[13px] font-semibold text-primary">
              {pricingType === 'FREE'
                ? t('courses.free')
                : priceVal > 0
                  ? formatNumber(priceVal)
                  : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
