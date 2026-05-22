'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Plus, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import CoursesGrid from '@/components/course/CoursesGrid';
import useCourses from '@/components/course/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';

export default function CoursesPage() {
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const { t } = useTranslation();

  const {
    courses,
    totalCourses,
    isLoading,
    searchTerm,
    setSearchTerm,
    pricingFilter,
    setPricingFilter,
    handleViewCourse,
    handleEditCourse,
    handleDeleteCourse,
    refresh
  } = useCourses();

  const PRICING_FILTERS = [
    { value: 'ALL', label: t('courses.allCourses') },
    { value: 'FREE', label: t('wizard.free') },
    { value: 'ONE_TIME', label: t('wizard.oneTime') },
    { value: 'PAYMENT_PLAN', label: t('wizard.paymentPlan') },
    { value: 'SUBSCRIPTION', label: t('wizard.subscriptionType') }
  ];

  if (!selectedAcademy) {
    return (
      <div className="flex-1 p-6">
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t('common.noStoreSelected')}
          description={t('common.selectStoreToView')}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('courses.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? '…'
              : `${totalCourses} ${totalCourses !== 1 ? t('courses.courses') : t('courses.courseTitle')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refresh}
            title={t('common.refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push('/courses/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('courses.createCourse')}
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('courses.searchCourses')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={pricingFilter} onValueChange={setPricingFilter}>
            <SelectTrigger className="w-44" aria-label={t('common.filter')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRICING_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CoursesGrid
          courses={courses}
          searchTerm={searchTerm}
          onCreate={() => router.push('/courses/create')}
          onView={handleViewCourse}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
        />
      )}
    </div>
  );
}
