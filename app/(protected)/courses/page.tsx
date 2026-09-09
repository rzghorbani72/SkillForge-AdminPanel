'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import PageContainer from '@/components/layout/page-container';
import useCourses, { CourseWithRevenue } from '@/components/course/useCourses';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseRow } from '@/components/course/CourseRow';
import { GridSkeleton } from '@/components/course/GridSkeleton';
import { CourseFilterBar } from '@/components/course/CourseFilterBar';
import { COURSE_CARD_GRID_COLUMNS } from '@/components/course/courseUtils';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { RequirePermission } from '@/components/access-control/RequirePermission';

export default function CoursesPage() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState<string>('all');
  const [courseToDelete, setCourseToDelete] =
    useState<CourseWithRevenue | null>(null);

  const {
    courses,
    isLoading,
    searchTerm,
    setSearchTerm,
    pricingFilter,
    handleDeleteCourse
  } = useCourses();

  function handleCreate() {
    router.push('/courses/create');
  }

  function handleEditCard(course: CourseWithRevenue) {
    router.push(`/courses/${course.id}/edit`);
  }

  const categories = (() => {
    const raw: string[] = [];
    courses.forEach((c) => {
      const cat = (c as any).Category?.name ?? (c as any).category ?? '';
      if (cat && !raw.includes(cat)) raw.push(cat);
    });
    return raw;
  })();

  const filteredCourses = courses.filter((c) => {
    const catName = (c as any).Category?.name ?? (c as any).category ?? '';
    const catOk = category === 'all' || catName === category;
    const pricingOk =
      pricingFilter === 'ALL' || (c as any).pricing_type === pricingFilter;
    return catOk && pricingOk;
  });

  if (!selectedAcademy) {
    return (
      <RequirePermission resource="courses" action="read">
        <PageContainer>
          <EmptyState
            icon={<Building2 className="h-10 w-10" />}
            title={t('common.noStoreSelected')}
            description={t('common.selectStoreToView')}
          />
        </PageContainer>
      </RequirePermission>
    );
  }

  return (
    <RequirePermission resource="courses" action="read">
      <PageContainer>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {t('courses.content')}
            </div>
            <h1 className="text-[24px] font-bold leading-none tracking-tight">
              {t('courses.title')}
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {t('courses.pageSubtitle')}
            </p>
          </div>
        </div>

        <CourseFilterBar
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          view={view}
          onViewChange={setView}
        />

        {isLoading ? (
          <GridSkeleton />
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">{t('courses.noCourses')}</p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" /> {t('courses.newCourse')}
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: COURSE_CARD_GRID_COLUMNS }}
          >
            {filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onClick={() => router.push(`/courses/${c.id}`)}
                onEdit={() => handleEditCard(c)}
                onDelete={() => setCourseToDelete(c)}
              />
            ))}
            <button
              type="button"
              onClick={handleCreate}
              className="flex h-full min-h-[22rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </span>
              <span className="text-base font-semibold text-foreground">
                {t('courses.newCourse')}
              </span>
            </button>
          </div>
        ) : (
          <div className="table-h-scroll rounded-xl border border-border bg-card">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('courses.course')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('courses.instructor')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('courses.student')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('courses.price')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('courses.lastUpdated')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('common.status')}
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <CourseRow
                    key={c.id}
                    course={c}
                    onClick={() => router.push(`/courses/${c.id}`)}
                    onEdit={() => handleEditCard(c)}
                    onDelete={() => setCourseToDelete(c)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmDeleteDialog
          open={!!courseToDelete}
          title={t('courses.deleteCourse')}
          description={t('courses.deleteCourseConfirm', {
            title: courseToDelete?.title ?? ''
          })}
          onConfirm={() => {
            if (courseToDelete) handleDeleteCourse(courseToDelete);
            setCourseToDelete(null);
          }}
          onCancel={() => setCourseToDelete(null)}
        />
      </PageContainer>
    </RequirePermission>
  );
}
