'use client';

import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import PageContainer from '@/components/layout/page-container';
import NewCourseModal from '@/components/course/NewCourseModal';
import useCourses, { CourseWithRevenue } from '@/components/course/useCourses';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseRow } from '@/components/course/CourseRow';
import { GridSkeleton } from '@/components/course/GridSkeleton';
import { CourseFilterBar } from '@/components/course/CourseFilterBar';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';

export default function CoursesPage() {
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState<string>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | undefined>();
  const [courseToDelete, setCourseToDelete] =
    useState<CourseWithRevenue | null>(null);

  const {
    courses,
    isLoading,
    searchTerm,
    setSearchTerm,
    pricingFilter,
    refresh,
    handleDeleteCourse
  } = useCourses();

  function handleEditCard(course: CourseWithRevenue) {
    setEditCourseId(course.id);
    setShowWizard(true);
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
      <PageContainer>
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t('common.noStoreSelected')}
          description={t('common.selectStoreToView')}
        />
      </PageContainer>
    );
  }

  return (
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
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => setShowWizard(true)}
          >
            <Plus className="h-3.5 w-3.5" /> {t('courses.newCourse')}
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
          }}
        >
          {filteredCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onEdit={() => handleEditCard(c)}
              onDelete={() => setCourseToDelete(c)}
            />
          ))}
          <button
            onClick={() => setShowWizard(true)}
            className="flex min-h-[260px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-[14px] font-semibold text-foreground">
              {t('courses.newCourse')}
            </span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('courses.course')}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('courses.instructor')}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('courses.student')}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('courses.price')}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t('courses.lastUpdated')}
                </th>
                <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                  onEdit={() => handleEditCard(c)}
                  onDelete={() => setCourseToDelete(c)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewCourseModal
        open={showWizard}
        onClose={() => {
          setShowWizard(false);
          setEditCourseId(undefined);
        }}
        onCreated={refresh}
        editCourseId={editCourseId}
      />

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
  );
}
