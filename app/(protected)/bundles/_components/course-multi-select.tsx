'use client';

import { EntityMultiSelect } from '@/components/shared/entity-multi-select';
import { Course } from './shared';

// ─── Course multi-select ─────────────────────────────────────────────────────

export function CourseMultiSelect({
  courses,
  selected,
  onChange,
  t,
  formatCurrency,
}: {
  courses: Course[];
  selected: string[];
  onChange: (ids: string[]) => void;
  t: (k: string) => string;
  formatCurrency: (n: number) => string;
}) {
  const selectedCourses = courses.filter((c) => selected.includes(c.id));
  const originalTotal = selectedCourses.reduce((s, c) => s + (c.price ?? 0), 0);

  return (
    <div className="space-y-2">
      <EntityMultiSelect
        items={courses.map((c) => ({ id: c.id, title: c.title }))}
        selected={selected}
        onChange={onChange}
        renderMeta={(item) => formatCurrency(courses.find((c) => c.id === item.id)?.price ?? 0)}
        labels={{
          placeholder: t('bundles.selectCourses'),
          selected: t('bundles.selectedCourses'),
          search: t('bundles.searchCourses'),
          empty: t('bundles.noCourses'),
          remove: t('bundles.removeCourse'),
        }}
      />

      {selectedCourses.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('bundles.originalTotal')}:{' '}
          <span className="font-medium">{formatCurrency(originalTotal)}</span>
        </p>
      )}
    </div>
  );
}
