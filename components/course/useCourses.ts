import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import { Course } from '@/types/api';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

type UseCoursesReturn = {
  courses: Course[];
  totalCourses: number;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleViewCourse: (course: Course) => void;
  handleEditCourse: (course: Course) => void;
  handleDeleteCourse: (course: Course) => void;
};

const useCourses = (): UseCoursesReturn => {
  const router = useRouter();
  const { selectedSchool } = useSchool();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const totalCourses = courses.length;

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return courses;
    }

    return courses.filter((course) => {
      const titleMatch = course.title?.toLowerCase().includes(term);
      const slugMatch = course.slug?.toLowerCase().includes(term);
      const descriptionMatch = course.description?.toLowerCase().includes(term);
      const shortDescriptionMatch = course.short_description
        ?.toLowerCase()
        .includes(term);
      const categoryMatch = (course as any)?.category?.name
        ?.toLowerCase()
        .includes(term);

      return (
        titleMatch ||
        slugMatch ||
        descriptionMatch ||
        shortDescriptionMatch ||
        categoryMatch
      );
    });
  }, [courses, searchTerm]);

  useEffect(() => {
    if (selectedSchool) {
      fetchCourses();
    }
  }, [selectedSchool]);

  const fetchCourses = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getCourses();
      // Handle new response structure with access control
      let nextCourses: Course[] = [];
      if (response && response && Array.isArray(response)) {
        nextCourses = response;
      } else if (Array.isArray(response)) {
        // Fallback for old response format
        nextCourses = response;
      } else if (response && Array.isArray(response.courses)) {
        nextCourses = response.courses;
      }

      // Optionally filter by school if present on objects
      if (selectedSchool && nextCourses.length > 0) {
        nextCourses = nextCourses.filter((c) =>
          (c as any).school_id
            ? (c as any).school_id === selectedSchool.id
            : true
        );
      }

      setCourses(nextCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      ErrorHandler.handleApiError(error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    router.push(`/courses/${course.id}`);
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/courses/${course.id}/edit`);
  };

  const handleDeleteCourseHandler = async (course: Course) => {
    try {
      const response = await apiClient.deleteCourse(course.id);
      if (response && response.status === 200) {
        toast.success((response.data as any).message);
        fetchCourses();
      } else {
        toast.error('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  // Debounce the delete handler to prevent multiple rapid deletions
  const handleDeleteCourse = useDebouncedCallback(
    handleDeleteCourseHandler,
    500
  );

  return {
    courses: filteredCourses,
    totalCourses,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleViewCourse,
    handleEditCourse,
    handleDeleteCourse
  };
};

export default useCourses;
