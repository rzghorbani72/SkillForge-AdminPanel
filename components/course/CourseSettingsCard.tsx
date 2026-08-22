'use client';

import { UseFormReturn } from 'react-hook-form';
import { Star, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import { CourseFormData } from './schema';

export default function CourseSettingsCard({
  form
}: {
  form: UseFormReturn<CourseFormData>;
}) {
  const { t } = useTranslation();
  const allowDownloads = form.watch('allow_downloads');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.courseSettings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex max-w-md items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <FormLabel className="text-sm font-medium">
                    {t('courses.featured')}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t('courses.highlightedOnHomepage')}
                  </p>
                </div>
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
          name="allow_downloads"
          render={({ field }) => (
            <FormItem className="flex max-w-md items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <FormLabel className="text-sm font-medium">
                    {t('courses.secureMode')}
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {field.value
                      ? t('courses.secureModeOffHint')
                      : t('courses.secureModeOnHint')}
                  </p>
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={!field.value}
                  onCheckedChange={(secure) => field.onChange(!secure)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apply_downloads_to_lessons"
          render={({ field }) => (
            <FormItem className="flex max-w-md items-start gap-2 px-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div>
                <FormLabel className="text-sm font-normal">
                  {t('courses.applyDownloadsToLessons')}
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  {allowDownloads
                    ? t('courses.applyDownloadsToLessonsOnHint')
                    : t('courses.applyDownloadsToLessonsOffHint')}
                </p>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
