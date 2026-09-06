'use client';

import { useCategoriesStore } from '@/lib/store';
import { sumDurationSeconds } from '../course-drafts';
import type { CourseType, LessonDraft, SeasonDraft } from '../course-drafts';
import type { CourseFormData } from '../schema';
import { CourseStudentPreview } from '../student-preview';

type StepPreviewProps = {
  values: CourseFormData;
  seasons: SeasonDraft[];
  lessons: LessonDraft[];
  coverPreviewUrl: string | null;
  courseType: CourseType;
};

/**
 * Step 5 — the course as a student meets it, built from the unsaved draft so
 * the manager checks the real thing before it goes live.
 */
export function StepPreview({
  values,
  seasons,
  lessons,
  coverPreviewUrl,
  courseType
}: StepPreviewProps) {
  const { categories } = useCategoriesStore();
  const category = categories.find(
    (c) => c.id.toString() === values.category_id
  );

  return (
    <CourseStudentPreview
      showCurriculum={courseType !== 'LIVE'}
      course={{
        title: values.title,
        description: values.description,
        coverUrl: coverPreviewUrl,
        categoryName: category?.name ?? null,
        published: values.published,
        price: Number(values.primary_price || 0),
        beforeDiscount: Number(values.secondary_price || 0) || null,
        lessonCount: lessons.length,
        totalSeconds: sumDurationSeconds(lessons),
        seasons: seasons.map((season) => ({
          key: season.clientKey,
          title: season.title,
          lessons: lessons
            .filter((lesson) => lesson.seasonClientKey === season.clientKey)
            .map((lesson) => ({
              key: lesson.clientKey,
              title: lesson.title,
              isFree: lesson.is_free,
              duration: lesson.duration
            }))
        }))
      }}
    />
  );
}
