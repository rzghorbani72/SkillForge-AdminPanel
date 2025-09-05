import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { Course } from '@/types/api';

type UseCoursesReturn = {
  courses: Course[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleViewCourse: (course: Course) => void;
  handleEditCourse: (course: Course) => void;
};

const useCourses = (): UseCoursesReturn => {
  const router = useRouter();
  const { selectedSchool } = useSchool();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  return {
    courses,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleViewCourse,
    handleEditCourse
  };
};

export default useCourses;
