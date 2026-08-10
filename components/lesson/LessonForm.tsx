'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LessonFormData, lessonFormSchema } from './schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import LessonContentFields from './lesson-content-fields';
import type { LiveSession } from '@/types/api';

type Props = {
  initialValues: Partial<LessonFormData> & { season_id: string };
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  liveSessionLessonId?: string;
  serverLessonType?: string;
  liveSessionInitial?: LiveSession | null;
  onLiveSessionSaved?: () => void;
};

const LESSON_TYPE_OPTIONS = [
  { value: 'VIDEO', labelKey: 'courses.lessonTypeVideo' },
  { value: 'AUDIO', labelKey: 'courses.lessonTypeAudio' },
  { value: 'TEXT', labelKey: 'courses.lessonTypeText' },
  { value: 'QUIZ', labelKey: 'courses.lessonTypeQuiz' },
  { value: 'ASSIGNMENT', labelKey: 'courses.lessonTypeAssignment' },
  { value: 'LIVE', labelKey: 'courses.lessonTypeLive' }
] as const;

const LessonForm = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel,
  liveSessionLessonId,
  serverLessonType,
  liveSessionInitial,
  onLiveSessionSaved
}: Props) => {
  const { t } = useTranslation();
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      season_id: initialValues.season_id,
      audio_id: initialValues.audio_id ?? '',
      video_id: initialValues.video_id ?? '',
      cover_id: initialValues.cover_id ?? '',
      document_id: initialValues.document_id ?? '',
      category_id: initialValues.category_id ?? '',
      published: initialValues.published ?? false,
      is_free: initialValues.is_free ?? false,
      lesson_type:
        (initialValues.lesson_type as LessonFormData['lesson_type']) ?? 'VIDEO'
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4" />
          {t('courses.lessonInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('courses.lessonForm.titleLabel')}{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('courses.lessonForm.titlePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('courses.lessonForm.titleHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'courses.lessonForm.descriptionPlaceholder'
                      )}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('courses.lessonForm.descriptionHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lesson_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.lessonType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LESSON_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('courses.lessonForm.typeHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-foreground">
                {t('courses.lessonForm.contentSection')}
              </h3>
              <LessonContentFields
                form={form}
                liveSessionLessonId={liveSessionLessonId}
                serverLessonType={serverLessonType}
                liveSessionInitial={liveSessionInitial}
                onLiveSessionSaved={onLiveSessionSaved}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.category')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('courses.selectCategory')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('courses.lessonForm.categoryHint')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('courses.published')}
                      </FormLabel>
                      <FormDescription>
                        {t('courses.lessonForm.publishedHint')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('courses.lessonForm.freeLabel')}
                      </FormLabel>
                      <FormDescription>
                        {t('courses.lessonForm.freeHint')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('common.saving')
                  : (submitLabel ?? t('common.save'))}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
