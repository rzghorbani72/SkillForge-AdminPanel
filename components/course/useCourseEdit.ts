import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { Course } from '@/types/api';
import { CourseFormData } from './schema';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';

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
  const { selectedSchool } = useSchool();
  const courseId = params.course_id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<CourseFormData | null>(
    null
  );

  const imageUpload = useImageUpload({
    onSuccess: (imageId) => {
      // This will be handled by the form component
    }
  });

  useEffect(() => {
    if (courseId && selectedSchool) {
      fetchCourse();
    }
  }, [courseId, selectedSchool]);

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
          primary_price: response.price
            ? (response.price / 100).toFixed(2)
            : '0.00',
          secondary_price: response.original_price
            ? (response.original_price / 100).toFixed(2)
            : '0.00',
          category_id: response.category_id?.toString() || '',
          season_id: '',
          audio_id: response.audio_id?.toString() || '',
          video_id: response.video_id?.toString() || '',
          cover_id: response.cover?.id?.toString() || '',
          published: response.is_published || false
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

  const onSubmit = async (data: CourseFormData) => {
    if (!selectedSchool || !course) {
      toast.error('Course or school not found');
      return;
    }

    try {
      setIsSubmitting(true);

      if (!data.title.trim() || data.title.trim().length < 5) {
        toast.error('Title must be at least 5 characters long');
        return;
      }

      if (!data.primary_price || !data.secondary_price) {
        toast.error('Both primary and secondary prices are required');
        return;
      }

      const primaryPrice = Number(data.primary_price);
      const secondaryPrice = Number(data.secondary_price);

      if (isNaN(primaryPrice) || isNaN(secondaryPrice)) {
        toast.error('Prices must be valid numbers');
        return;
      }

      if (
        primaryPrice < 0 ||
        primaryPrice > 999999.99 ||
        secondaryPrice < 0 ||
        secondaryPrice > 999999.99
      ) {
        toast.error('Prices must be between 0 and 999,999.99');
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
        published: !!data.published
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
