'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { UseFormReturn } from 'react-hook-form';
import {
  COURSE_DESCRIPTION_MAX,
  COURSE_TITLE_MAX,
  CourseFormData
} from './schema';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

type Props = {
  form: UseFormReturn<CourseFormData>;
};

const CreateCourseBasicInfo = ({ form }: Props) => {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.basicInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>{t('courses.courseTitle')} *</FormLabel>
              <FormControl>
                <Input placeholder={t('courses.enterCourseTitle')} {...field} />
              </FormControl>
              <FormMessage />
              <p
                className={`text-sm ${(field.value?.length || 0) >= COURSE_TITLE_MAX - 10 ? 'text-orange-600' : 'text-muted-foreground'}`}
              >
                {t('courses.titleLength')} (
                {formatNumber(field.value?.length || 0)}/
                {formatNumber(COURSE_TITLE_MAX)})
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('courses.description')} *</FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('courses.enterDescription')}
                  maxLength={COURSE_DESCRIPTION_MAX}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default CreateCourseBasicInfo;
