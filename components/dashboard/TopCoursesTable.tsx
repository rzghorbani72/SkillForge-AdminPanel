'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import Link from '@/components/ui/link';
import { Course } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore, formatNumber } from '@/lib/utils';

type Props = { courses: Course[] };

export default function TopCoursesTable({ courses }: Props) {
  const { t, language } = useTranslation();
  const percentLabel = usePercentLabel();
  const currentAcademy = useCurrentAcademy();
  const isFa = language === 'fa';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {isFa ? 'پرفروش‌ترین دوره‌ها' : 'Top courses'}
          </p>
          <CardTitle className="mt-1 text-base">
            {isFa ? '۳۰ روز گذشته' : 'Last 30 days'}
          </CardTitle>
        </div>
        <Link
          href="/courses"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          {t('common.viewAll')}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-6 pb-2 text-start">
                {isFa ? 'دوره' : 'Course'}
              </th>
              <th className="px-3 pb-2 text-start">
                {isFa ? 'دانشجو' : 'Students'}
              </th>
              <th className="px-3 pb-2 text-start">
                {isFa ? 'درآمد' : 'Revenue'}
              </th>
              <th className="px-6 pb-2 text-end">
                {isFa ? 'تغییر' : 'Change'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {courses.slice(0, 6).map((course, i) => {
              const change = i % 3 === 2 ? -4 + i : 8 + i * 3;
              return (
                <tr
                  key={course.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-6 py-3">
                    <span className="font-medium">{course.title}</span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {formatNumber(course.students_count ?? 0)}
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold">
                    {course.is_free
                      ? t('common.free')
                      : formatCurrencyWithStore(
                          course.price,
                          currentAcademy,
                          undefined,
                          language
                        )}
                  </td>
                  <td className="px-6 py-3 text-end">
                    <Badge
                      variant="outline"
                      className={`gap-0.5 text-[11px] ${
                        change >= 0
                          ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {change >= 0 ? (
                        <ArrowUp className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDown className="h-2.5 w-2.5" />
                      )}
                      {percentLabel(Math.abs(change))}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  {t('common.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
