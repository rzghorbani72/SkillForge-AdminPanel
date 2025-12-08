import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useStore } from '@/hooks/useStore';
import { Course } from '@/types/api';
import { CourseFormData } from './schema';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

type UseCourseEditReturn = {
  course: Course | null;
  isLoading: boolean;
  isSubmitting: boolean;
  initialValues: CourseFormData | null;
  onSubmit: (data: CourseFormData) => Promise<void>;
  handleCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeCoverImage: () => void;
  coverImage: File | null;
  coverPreview: string | null;
};

const useCourseEdit = (): UseCourseEditReturn => {
  const router = useRouter();
  const params = useParams();
  const { selectedStore } = useStore();
  const courseId = params.course_id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<CourseFormData | null>(
    null
  );

  const imageUpload = useImageUpload({
    onSuccess: () => {
      // This will be handled by the form component
    }
  });

  useEffect(() => {
    if (courseId && selectedStore) {
      fetchCourse();
    }
  }, [courseId, selectedStore]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourse(parseInt(courseId));
      if (response) {
        setCourse(response);
        // Set the existing cover image as preview
        if (response.cover?.url) {
          imageUpload.reset();
          // We'll set the preview manually since we have an existing image
        }
        setInitialValues({
          title: response.title || '',
          description: response.description || '',
          primary_price:
            typeof response.price === 'number'
              ? Math.trunc(response.price).toString()
              : '0',
          secondary_price:
            typeof response.original_price === 'number'
              ? Math.trunc(response.original_price).toString()
              : '0',
          category_id: response.category_id?.toString() || '',
          season_id: '',
          audio_id: response.audio_id?.toString() || '',
          video_id: response.video_id?.toString() || '',
          cover_id: response.cover?.id?.toString() || '',
          published: response.is_published || false,
          is_featured: !!response.is_featured
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      ErrorHandler.handleApiError(error);
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (data: CourseFormData) => {
    if (!selectedStore || !course) {
      toast.error('Course or store not found');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (!data.title.trim() || data.title.trim().length < 1) {
        toast.error('Title is required');
        return;
      }
      const primaryPrice = Number(data.primary_price);
      const secondaryPrice = Number(data.secondary_price);
      if (!data.primary_price || !data.secondary_price) {
        toast.error('Both primary and secondary prices are required');
        return;
      }
      if (
        isNaN(primaryPrice) ||
        isNaN(secondaryPrice) ||
        !Number.isInteger(primaryPrice) ||
        !Number.isInteger(secondaryPrice)
      ) {
        toast.error('Prices must be whole numbers');
        return;
      }

      if (secondaryPrice > primaryPrice) {
        toast.error('Secondary price cannot be greater than primary price');
        return;
      }

      if (
        primaryPrice < 0 ||
        primaryPrice > 999999999 ||
        secondaryPrice < 0 ||
        secondaryPrice > 999999999
      ) {
        toast.error('Prices must be between 0 and 999,999,999');
        return;
      }

      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        primary_price: primaryPrice,
        secondary_price: secondaryPrice,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        season_id: data.season_id ? Number(data.season_id) : undefined,
        audio_id: data.audio_id ? Number(data.audio_id) : undefined,
        video_id: data.video_id ? Number(data.video_id) : undefined,
        cover_id: data.cover_id ? Number(data.cover_id) : undefined,
        published: !!data.published,
        is_featured: !!data.is_featured
      };

      await apiClient.updateCourse(course.id, courseData);
      toast.success('Course updated successfully');
      router.push('/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  return {
    course,
    isLoading,
    isSubmitting,
    initialValues,
    onSubmit,
    handleCoverImageChange: imageUpload.handleFileChange,
    removeCoverImage: imageUpload.removeFile,
    coverImage: imageUpload.selectedFile,
    coverPreview: imageUpload.preview || course?.cover?.url || null
  };
};

export default useCourseEdit;
