'use client';

import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { StatusPill } from './StatusPill';
import { courseHue, formatNumber } from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

export function CourseRow({
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
  const teacher =
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';

  return (
    <tr
      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-14 flex-shrink-0 overflow-hidden rounded-md"
            style={{
              background: `linear-gradient(135deg, hsl(${hue} 80% 82%), hsl(${hue} 60% 92%))`
            }}
          />
          <div>
            <div className="text-[13.5px] font-semibold">{course.title}</div>
            <div className="text-[11.5px] text-muted-foreground">
              {(course as any).seasons_count ?? 0} {t('courses.season')} ·{' '}
              {(course as any).lessons_count ?? 0} {t('courses.lesson')}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              background: `hsl(${hue} 80% 90%)`,
              color: `hsl(${hue} 60% 38%)`
            }}
          >
            {teacher.charAt(0)}
          </span>
          <span className="text-[13px]">{teacher}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-[13px]">
        {formatNumber(studentsCount)}
      </td>
      <td className="px-4 py-3 font-mono text-[13px] text-primary">
        {pricingType === 'FREE'
          ? t('courses.free')
          : priceVal > 0
            ? formatNumber(priceVal)
            : '—'}
      </td>
      <td className="px-4 py-3 text-[12px] text-muted-foreground">
        {(course as any).updated_at
          ? new Date((course as any).updated_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={(course as any).status ?? 'DRAFT'} />
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
