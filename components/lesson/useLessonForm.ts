import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import { Course, Lesson, Season } from '@/types/api';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

type LessonFormData = {
  title: string;
  description?: string;
  season_id: string;
  audio_id?: string;
  video_id?: string;
  cover_id?: string;
  document_id?: string;
  category_id?: string;
  published: boolean;
  is_free: boolean;
  lesson_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'QUIZ';
};
import { toast } from 'sonner';

type UseLessonFormReturn = {
  lesson: Lesson | null;
  season: Season | null;
  course: Course | null;
  isLoading: boolean;
  isSubmitting: boolean;
  initialValues: LessonFormData | null;
  onSubmit: (data: LessonFormData) => Promise<void>;
  isEdit: boolean;
};

const useLessonForm = (isEdit: boolean = false): UseLessonFormReturn => {
  const router = useRouter();
  const params = useParams();
  const { selectedSchool } = useSchool();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const lessonId = params.lesson_id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<LessonFormData | null>(
    null
  );

  useEffect(() => {
    if (courseId && seasonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, selectedSchool, isEdit, lessonId]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const promises = [
        apiClient.getSeason(parseInt(seasonId)),
        apiClient.getCourse(parseInt(courseId))
      ];

      if (isEdit && lessonId) {
        promises.push(apiClient.getLesson(parseInt(lessonId)));
      }

      const [seasonResponse, courseResponse, lessonResponse] =
        await Promise.all(promises);

      if (seasonResponse) setSeason(seasonResponse as Season);
      if (courseResponse) setCourse(courseResponse as Course);

      if (isEdit && lessonResponse) {
        const lessonData = lessonResponse as Lesson;
        setLesson(lessonData);
        setInitialValues({
          title: lessonData.title,
          description: lessonData.description ?? '',
          season_id: seasonId,
          audio_id: lessonData.audio_id ? String(lessonData.audio_id) : '',
          video_id: lessonData.video_id ? String(lessonData.video_id) : '',
          cover_id: lessonData.image_id ? String(lessonData.image_id) : '',
          document_id: lessonData.document_id
            ? String(lessonData.document_id)
            : '',
          category_id: lessonData.category_id
            ? String(lessonData.category_id)
            : '',
          published: Boolean(
            (lessonData as any).published ??
              (lessonData as any).is_active ??
              lessonData.is_published
          ),
          is_free: Boolean(lessonData.is_free),
          lesson_type: (lessonData.lesson_type as any) ?? 'VIDEO'
        });
      } else if (!isEdit) {
        setInitialValues({
          title: '',
          description: '',
          season_id: seasonId,
          audio_id: '',
          video_id: '',
          cover_id: '',
          document_id: '',
          category_id: '',
          published: false,
          is_free: false,
          lesson_type: 'VIDEO'
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (data: LessonFormData) => {
    if (!selectedSchool) {
      toast.error('Please select a school first');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const lessonData = {
        title: data.title,
        description: data.description || '',
        season_id: parseInt(data.season_id),
        audio_id: data.audio_id ? parseInt(data.audio_id) : undefined,
        video_id: data.video_id ? parseInt(data.video_id) : undefined,
        cover_id: data.cover_id ? parseInt(data.cover_id) : undefined,
        document_id: data.document_id ? parseInt(data.document_id) : undefined,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
        published: data.published,
        is_free: data.is_free,
        lesson_type: data.lesson_type
      };

      if (isEdit && lessonId) {
        await apiClient.updateLesson(parseInt(lessonId), lessonData);
        toast.success('Lesson updated successfully!');
        router.push(
          `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}`
        );
      } else {
        await apiClient.createLesson(lessonData);
        toast.success('Lesson created successfully!');
        router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} lesson:`, error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  console.log('initialValues', initialValues);
  console.log('lesson', lesson);
  console.log('season', season);
  console.log('course', course);

  return {
    lesson,
    season,
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    isEdit
  };
};

export default useLessonForm;
