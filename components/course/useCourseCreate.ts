import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

// Schema with proper validation for all required fields
const courseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(400, 'Description must be less than 400 characters'),
  primary_price: z
    .string()
    .min(1, 'Primary price is required')
    .refine(
      (val) => /^\d+$/.test(val.trim()),
      'Primary price must be a whole number'
    )
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'Primary price must be between 0 and 999,999,999'),
  secondary_price: z
    .string()
    .min(1, 'Secondary price is required')
    .refine(
      (val) => /^\d+$/.test(val.trim()),
      'Secondary price must be a whole number'
    )
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999999;
    }, 'Secondary price must be between 0 and 999,999,999'),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  image_id: z.string().optional(),
  published: z.boolean().default(false)
});

export type CourseCreateFormData = z.infer<typeof courseFormSchema>;

export const useCourseCreate = () => {
  const router = useRouter();
  const { selectedStore: selectedSchool } = useSchool();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CourseCreateFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      primary_price: '0',
      secondary_price: '0',
      category_id: '',
      season_id: '',
      audio_id: '',
      video_id: '',
      image_id: '',
      published: false
    }
  });

  const imageUpload = useImageUpload({
    title: form.watch('title') || 'Course Cover',
    description: form.watch('description') || 'Course cover image',
    onSuccess: (image) => {
      form.setValue('image_id', image.id.toString());
    }
  });

  const onSubmitHandler = async (data: CourseCreateFormData) => {
    if (!selectedSchool) {
      toast.error('Please select a store first');
      return;
    }

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Validate required fields
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
      if (secondaryPrice > primaryPrice) {
        toast.error('Secondary price cannot be greater than primary price');
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

      if (
        primaryPrice < 0 ||
        primaryPrice > 999999999 ||
        secondaryPrice < 0 ||
        secondaryPrice > 999999999
      ) {
        toast.error('Prices must be between 0 and 999,999,999');
        return;
      }

      // Create course with API-expected data structure
      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        primary_price: primaryPrice,
        secondary_price: secondaryPrice,
        meta_tags: [], // Empty meta tags array as required by API
        category_id: data.category_id ? Number(data.category_id) : undefined,
        season_id: data.season_id ? Number(data.season_id) : undefined,
        audio_id: data.audio_id ? Number(data.audio_id) : undefined,
        video_id: data.video_id ? Number(data.video_id) : undefined,
        cover_id: data.image_id ? Number(data.image_id) : undefined,
        published: !!data.published
      };

      await apiClient.createCourse(courseData);
      toast.success('Course created successfully');
      router.push('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the submit handler to prevent multiple rapid submissions
  const onSubmit = useDebouncedCallback(onSubmitHandler, 500);

  const handleBack = () => {
    router.back();
  };

  return {
    form,
    selectedSchool,
    isLoading,
    coverImage: imageUpload.selectedFile,
    coverPreview: imageUpload.preview,
    isUploading: imageUpload.isUploading,
    handleCoverImageChange: imageUpload.handleFileChange,
    removeCoverImage: imageUpload.removeFile,
    uploadCoverImage: imageUpload.uploadImage,
    cancelUpload: imageUpload.cancelUpload,
    onSubmit,
    handleBack
  };
};
