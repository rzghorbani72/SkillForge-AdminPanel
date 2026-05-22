'use client';

import {
  Users,
  DollarSign,
  BookOpen,
  MoreVertical,
  Plus,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CourseWithRevenue } from './useCourses';
import { useTranslation } from '@/lib/i18n/hooks';

interface CoursesGridProps {
  courses: CourseWithRevenue[];
  searchTerm: string;
  onCreate: () => void;
  onView: (course: CourseWithRevenue) => void;
  onEdit: (course: CourseWithRevenue) => void;
  onDelete: (course: CourseWithRevenue) => void;
}

const PRICING_BADGE: Record<string, { labelKey: string; color: string }> = {
  FREE: { labelKey: 'wizard.free', color: 'bg-emerald-100 text-emerald-700' },
  ONE_TIME: { labelKey: 'wizard.oneTime', color: 'bg-blue-100 text-blue-700' },
  PAYMENT_PLAN: {
    labelKey: 'wizard.paymentPlan',
    color: 'bg-violet-100 text-violet-700'
  },
  SUBSCRIPTION: {
    labelKey: 'wizard.subscriptionType',
    color: 'bg-amber-100 text-amber-700'
  }
};

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

function CourseThumbnail({ course }: { course: CourseWithRevenue }) {
  const url =
    (course as any).cover?.url || (course as any).cover?.file_path || null;

  if (url) {
    return (
      <img
        src={url}
        alt={course.title}
        className="h-full w-full object-cover"
      />
    );
  }

  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600'
  ];
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br',
        gradients[course.id % gradients.length]
      )}
    >
      <BookOpen className="h-10 w-10 text-white/80" />
    </div>
  );
}

function CourseCard({
  course,
  onView,
  onEdit,
  onDelete
}: {
  course: CourseWithRevenue;
  onView: (c: CourseWithRevenue) => void;
  onEdit: (c: CourseWithRevenue) => void;
  onDelete: (c: CourseWithRevenue) => void;
}) {
  const { t } = useTranslation();
  const pricingKey = (course as any).pricing_type ?? '';
  const pricing = PRICING_BADGE[pricingKey] ?? null;
  const price = (course as any).primary_price ?? 0;

  return (
    <div
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => onView(course)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <CourseThumbnail course={course} />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
              course.is_published
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-700/80 text-white'
            )}
          >
            {course.is_published ? t('courses.published') : t('courses.draft')}
          </span>
          {(course as any).is_featured && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Star className="h-2.5 w-2.5" />
              {t('courses.featured')}
            </span>
          )}
        </div>
        <div
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full bg-background/90 shadow"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(course)}>
                {t('common.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(course)}>
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(course)}
              >
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          {pricing && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                pricing.color
              )}
            >
              {t(pricing.labelKey)}
            </span>
          )}
        </div>

        {price > 0 && (
          <p className="mt-1 text-base font-bold text-foreground">
            {price.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              Toman
            </span>
          </p>
        )}
        {price === 0 && (
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            {t('courses.free')}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {(course.enrollments_count > 0
                ? course.enrollments_count
                : ((course as any).students_count ?? 0)
              ).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {(course as any).lessons_count ?? 0}
            </span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <DollarSign className="h-3.5 w-3.5" />
            {formatRevenue(course.revenue ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CoursesGrid({
  courses,
  searchTerm,
  onCreate,
  onView,
  onEdit,
  onDelete
}: CoursesGridProps) {
  const { t } = useTranslation();

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">
          {searchTerm
            ? t('courses.noCoursesMatch', { term: searchTerm })
            : t('courses.noCourses')}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {searchTerm
            ? t('common.tryAdjustingFilters')
            : t('courses.getStarted')}
        </p>
        {!searchTerm && (
          <Button className="mt-6" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('courses.createFirstCourse')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
