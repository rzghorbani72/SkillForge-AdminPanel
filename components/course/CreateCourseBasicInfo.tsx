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
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { CourseCreateFormData } from './useCourseCreate';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
};

const CreateCourseBasicInfo = ({ form }: Props) => {
  const { t } = useTranslation();

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
            <FormItem>
              <FormLabel>{t('courses.courseTitle')} *</FormLabel>
              <FormControl>
                <Input placeholder={t('courses.enterCourseTitle')} {...field} />
              </FormControl>
              <FormMessage />
              <p
                className={`text-sm ${(field.value?.length || 0) >= 70 ? 'text-orange-600' : 'text-gray-600'}`}
              >
                {t('courses.titleLength')} ({field.value?.length || 0}/80)
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
                <Textarea
                  placeholder={t('courses.enterDescription')}
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
              <p
                className={`text-sm ${(field.value?.length || 0) >= 350 ? 'text-orange-600' : 'text-gray-600'}`}
              >
                {t('courses.descriptionLength')} ({field.value?.length || 0}
                /400)
              </p>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default CreateCourseBasicInfo;
