'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { StatusPill } from './StatusPill';
import { courseHue } from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

export function CourseRow({
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
  const teacher =
    (course as any).Profile?.display_name ??
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const status = course.is_published
    ? 'PUBLISHED'
    : ((course as any).status ?? 'DRAFT');
  const seasonsCount =
    (course as any).Season?.length ?? (course as any).seasons_count ?? 0;
  const lessonsCount =
    course.lessons_count ?? (course as any)._count?.Lesson ?? 0;

  return (
    <tr
      className={`border-b border-border/50 transition-colors hover:bg-muted/30${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick}
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
            <div className="text-base font-semibold">{course.title}</div>
            <div className="text-sm text-muted-foreground">
              {seasonsCount} {t('courses.season')} · {lessonsCount}{' '}
              {t('courses.lesson')}
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
          <span className="text-base">{teacher}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-base">
        {studentsCount > 0
          ? formatNumber(studentsCount)
          : t('courses.beFirstStudent')}
      </td>
      <td className="px-4 py-3.5 text-base font-medium tabular-nums text-primary">
        {pricingType === 'FREE'
          ? t('courses.free')
          : priceVal > 0
            ? formatNumber(priceVal)
            : '—'}
      </td>
      <td className="px-4 py-3.5 text-sm text-muted-foreground">
        {(course as any).updated_at
          ? new Date((course as any).updated_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <StatusPill status={status} />
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              title={t('common.edit')}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title={t('common.delete')}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
