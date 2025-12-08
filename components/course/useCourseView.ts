import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';

export const useCourseView = (courseId: string) => {
  const router = useRouter();
  const { selectedStore } = useStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId && selectedStore) {
      fetchCourse();
    }
  }, [courseId, selectedStore]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourse(parseInt(courseId));
      if (response) setCourse(response);
    } catch (error) {
      console.error('Error fetching course:', error);
      ErrorHandler.handleApiError(error);
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = () => {
    router.push(`/courses/${courseId}/edit`);
  };

  const handleManageSeasons = () => {
    router.push(`/courses/${courseId}/seasons`);
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteCourse(course.id);
      toast.success('Course deleted successfully');
      router.push('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return {
    course,
    isLoading,
    isDeleting,
    selectedStore,
    handleEditCourse,
    handleManageSeasons,
    handleDeleteCourse,
    handleBack
  };
};
