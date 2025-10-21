import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import { Course, Season } from '@/types/api';

type UseSeasonsReturn = {
  seasons: Season[];
  courses: Course[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  refetch: () => void;
};

const useSeasons = (): UseSeasonsReturn => {
  const { selectedSchool } = useSchool();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;
    try {
      setIsLoading(true);
      const [seasonsResponse, coursesResponse] = await Promise.all([
        apiClient.getSeasons(),
        apiClient.getCourses()
      ]);

      // seasons extraction
      let nextSeasons: Season[] = [];
      const sData: any = (seasonsResponse as any).data ?? seasonsResponse;
      if (Array.isArray(sData)) nextSeasons = sData;
      else if (sData && Array.isArray(sData.data)) nextSeasons = sData.data;
      else if (
        (seasonsResponse as any).data &&
        Array.isArray((seasonsResponse as any).data)
      )
        nextSeasons = (seasonsResponse as any).data;

      if (selectedSchool && nextSeasons.length > 0) {
        nextSeasons = nextSeasons.filter((s) =>
          (s as any).school_id
            ? (s as any).school_id === selectedSchool.id
            : true
        );
      }
      setSeasons(nextSeasons);

      // courses extraction
      let nextCourses: Course[] = [];
      const cData: any = (coursesResponse as any).data ?? coursesResponse;
      if (Array.isArray(cData)) nextCourses = cData;
      else if (cData && Array.isArray(cData.data)) nextCourses = cData.data;
      else if (cData && Array.isArray(cData.courses))
        nextCourses = cData.courses;
      if (selectedSchool && nextCourses.length > 0) {
        nextCourses = nextCourses.filter((c) =>
          (c as any).school_id
            ? (c as any).school_id === selectedSchool.id
            : true
        );
      }
      setCourses(nextCourses);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      ErrorHandler.handleApiError(error);
      setSeasons([]);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    seasons,
    courses,
    isLoading,
    searchTerm,
    setSearchTerm,
    refetch: fetchData
  };
};

export default useSeasons;
