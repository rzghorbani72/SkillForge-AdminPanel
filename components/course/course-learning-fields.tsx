'use client';

import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  COURSE_LEARNING_OUTCOMES_MAX,
  COURSE_REQUIREMENTS_MAX,
  type CourseFormData,
} from './schema';

/** What students will learn and what they need first. */
export function CourseLearningFields({ form }: { form: UseFormReturn<CourseFormData> }) {
  const { t } = useTranslation();

  return (
    <>
      <FormField
        control={form.control}
        name="learning_outcomes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('courses.whatYouWillLearn')}</FormLabel>
            <FormControl>
              <Textarea
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('courses.whatYouWillLearnPlaceholder')}
                maxLength={COURSE_LEARNING_OUTCOMES_MAX}
                className="min-h-[120px]"
              />
            </FormControl>
            <FormDescription>{t('courses.whatYouWillLearnHint')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('courses.requirements')}</FormLabel>
            <FormControl>
              <Textarea
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('courses.requirementsPlaceholder')}
                maxLength={COURSE_REQUIREMENTS_MAX}
                className="min-h-[120px]"
              />
            </FormControl>
            <FormDescription>{t('courses.requirementsHint')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
