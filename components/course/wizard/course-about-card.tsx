'use client';

import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FileText } from 'lucide-react';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import { DIFFICULTY_LABEL } from '../CourseFactsCard';
import { COURSE_DESCRIPTION_MAX, COURSE_DIFFICULTIES, type CourseFormData } from '../schema';
import { SectionCard } from '@/components/shared/section-card';

type CourseAboutCardProps = {
  form: UseFormReturn<CourseFormData>;
  coverPreviewUrl: string | null;
  onCoverChange: (image: { id: string; url: string }) => void;
  children?: ReactNode;
};

/** "About the course": what a student reads on the course page. */
export function CourseAboutCard({
  form,
  coverPreviewUrl,
  onCoverChange,
  children,
}: CourseAboutCardProps) {
  const { t } = useTranslation();

  return (
    <SectionCard
      icon={FileText}
      title={t('liveWizard.aboutTitle')}
      hint={t('liveWizard.aboutHint')}
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('courses.courseTitle')}
              <span className="ms-0.5 text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder={t('courses.enterCourseTitle')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('courses.description')}
              <span className="ms-0.5 text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={t('courses.enterDescription')}
                maxLength={COURSE_DESCRIPTION_MAX}
                minRows={4}
              />
            </FormControl>
            <FormDescription>{t('liveWizard.descriptionHint')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[13px] font-bold">
            {t('courses.coverImage')}
            <span className="ms-1 text-xs font-normal text-muted-foreground">
              {t('liveWizard.optional')}
            </span>
          </span>
          <ImageUploadPreview
            title={form.watch('title')}
            description={form.watch('description')}
            existingImageUrl={coverPreviewUrl}
            onSuccess={onCoverChange}
            selectedImageId={form.watch('cover_id')}
            className="aspect-video w-full"
            placeholderText={t('liveWizard.coverPlaceholder')}
            placeholderSubtext={t('liveWizard.coverHint')}
          />
        </div>

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('courses.level')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('courses.level')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COURSE_DIFFICULTIES.map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(DIFFICULTY_LABEL[level])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {children}
    </SectionCard>
  );
}
