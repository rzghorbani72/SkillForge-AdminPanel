'use client';

import { useCallback } from 'react';
import { courseFormSchema, type CourseFormData } from '../schema';
import type { Dispatch, SetStateAction } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useCourseCover({
  form,
  save,
  setCoverPreviewUrl,
}: {
  form: UseFormReturn<
    {
      title: string;
      description: string;
      learning_outcomes: string;
      requirements: string;
      difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      is_certificate: boolean;
      certificate_rule: 'FINAL_QUIZ' | 'ALL_QUIZZES';
      access_duration_days: string;
      primary_price: string;
      secondary_price: string;
      meta_title: string;
      meta_description: string;
      keywords: string[];
      published: boolean;
      is_featured: boolean;
      base_price_active: boolean;
      allow_downloads: boolean;
      apply_downloads_to_lessons: boolean;
      category_id?: string | undefined;
      season_id?: string | undefined;
      audio_id?: string | undefined;
      video_id?: string | undefined;
      cover_id?: string | undefined;
    },
    any,
    {
      title: string;
      description: string;
      learning_outcomes: string;
      requirements: string;
      difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      is_certificate: boolean;
      certificate_rule: 'FINAL_QUIZ' | 'ALL_QUIZZES';
      access_duration_days: string;
      primary_price: string;
      secondary_price: string;
      meta_title: string;
      meta_description: string;
      keywords: string[];
      published: boolean;
      is_featured: boolean;
      base_price_active: boolean;
      allow_downloads: boolean;
      apply_downloads_to_lessons: boolean;
      category_id?: string | undefined;
      season_id?: string | undefined;
      audio_id?: string | undefined;
      video_id?: string | undefined;
      cover_id?: string | undefined;
    }
  >;
  save: (
    data: CourseFormData,
    {
      silent,
      silentSuccess,
    }?: { silent?: boolean | undefined; silentSuccess?: boolean | undefined },
  ) => Promise<boolean>;
  setCoverPreviewUrl: Dispatch<SetStateAction<string | null>>;
}) {
  const saveCover = useCallback(async () => {
    const values = form.getValues();
    // A half-filled form cannot be saved yet, so show what is missing instead
    // of dropping the new cover without a word.
    if (!courseFormSchema.safeParse(values).success) {
      void form.trigger();
      return;
    }
    await save(values, { silent: true });
  }, [form, save]);

  const handleCoverImageChange = useCallback(
    (image: { id: string; url: string }) => {
      if (image.id) {
        form.setValue('cover_id', image.id, {
          shouldDirty: true,
          shouldTouch: true,
        });
        setCoverPreviewUrl(image.url || null);
      } else {
        form.setValue('cover_id', '', { shouldDirty: true, shouldTouch: true });
        setCoverPreviewUrl(null);
      }
      void saveCover();
    },
    [form, saveCover],
  );

  return { handleCoverImageChange, saveCover };
}
