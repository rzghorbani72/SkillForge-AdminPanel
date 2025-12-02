'use client';

import { useRouter } from 'next/navigation';
import { useSchool } from '@/hooks/useSchool';
import Header from '@/components/course/Header';
import SearchBar from '@/components/course/SearchBar';
import CoursesGrid from '@/components/course/CoursesGrid';
import useCourses from '@/components/course/useCourses';
import { useTranslation } from '@/lib/i18n/hooks';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { School } from 'lucide-react';

export default function CoursesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const {
    courses,
    totalCourses,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleViewCourse,
    handleEditCourse,
    handleDeleteCourse
  } = useCourses();

  if (!selectedSchool) {
    return (
      <div className="page-wrapper flex-1 p-6">
        <EmptyState
          icon={<School className="h-10 w-10" />}
          title={t('common.noSchoolSelected')}
          description={t('common.selectSchoolToView')}
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message={t('courses.loadingCourses')} />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-6">
      <Header />
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <CoursesGrid
        courses={courses}
        searchTerm={searchTerm}
        onCreate={() => router.push('/courses/create')}
        onView={handleViewCourse}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
}
