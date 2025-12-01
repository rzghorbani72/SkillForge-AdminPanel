'use client';

import { useRouter } from 'next/navigation';
import { useSchool } from '@/hooks/useSchool';
import Header from '@/components/course/Header';
import SearchBar from '@/components/course/SearchBar';
import CoursesGrid from '@/components/course/CoursesGrid';
import useCourses from '@/components/course/useCourses';
import { useTranslation } from '@/lib/i18n/hooks';

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
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t('common.noSchoolSelected')}
            </h2>
            <p className="text-muted-foreground">
              {t('common.selectSchoolToView')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">
              {t('courses.loadingCourses')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
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
