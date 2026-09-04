'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/ui/link';
import { Course } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { formatCurrencyWithStore, formatNumber } from '@/lib/utils';

type Props = { courses: Course[] };

export default function TopCoursesTable({ courses }: Props) {
  const { t, language } = useTranslation();
  const currentAcademy = useCurrentAcademy();
  const isFa = language === 'fa';
  // "Top" has to mean something: rank by students, largest first.
  const ranked = [...courses]
    .sort((a, b) => (b.students_count ?? 0) - (a.students_count ?? 0))
    .slice(0, 6);

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {isFa ? 'پرفروش‌ترین دوره‌ها' : 'Top courses'}
          </p>
          <CardTitle className="mt-1 text-base">
            {isFa ? 'بر اساس تعداد دانشجو' : 'By student count'}
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
        <div className="table-h-scroll">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  {isFa ? 'وضعیت' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ranked.map((course) => {
                const revenue =
                  course.revenue ?? course.price * (course.students_count ?? 0);
                return (
                  <tr
                    key={course.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-base font-medium">
                        {course.title}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-base tabular-nums">
                      {formatNumber(course.students_count ?? 0)}
                    </td>
                    <td className="px-3 py-3.5 text-base font-semibold tabular-nums">
                      {course.is_free
                        ? t('common.free')
                        : formatCurrencyWithStore(
                            revenue,
                            currentAcademy,
                            undefined,
                            language
                          )}
                    </td>
                    <td className="px-6 py-3 text-end">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${
                          course.is_published
                            ? 'border-transparent bg-[hsl(var(--viz-accent)/0.12)] text-[hsl(var(--viz-accent))]'
                            : 'border-transparent bg-muted text-muted-foreground'
                        }`}
                      >
                        {course.is_published
                          ? t('common.published')
                          : t('common.draft')}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {courses.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-base text-muted-foreground"
                  >
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
