import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { Course, Lesson, Season } from '@/types/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const useLesson = () => {
  const params = useParams();
  const { selectedSchool } = useSchool();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId && seasonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [lessonsResponse, seasonResponse, courseResponse] =
        await Promise.all([
          apiClient.getLessons({ season_id: parseInt(seasonId) }),
          apiClient.getSeason(parseInt(seasonId)),
          apiClient.getCourse(parseInt(courseId))
        ]);

      if (lessonsResponse && Array.isArray(lessonsResponse)) {
        setLessons(lessonsResponse);
      }

      if (seasonResponse) {
        setSeason(seasonResponse);
      }

      if (courseResponse) {
        setCourse(courseResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  return {
    lessons,
    season,
    course,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleDeleteLesson
  };
};

export default useLesson;
