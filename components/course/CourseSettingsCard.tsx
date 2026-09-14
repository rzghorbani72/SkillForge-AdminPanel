'use client';

import { UseFormReturn } from 'react-hook-form';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import { CourseFormData } from './schema';

export default function CourseSettingsCard({ form }: { form: UseFormReturn<CourseFormData> }) {
  const { t } = useTranslation();

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
                  <FormLabel className="text-sm font-medium">{t('courses.featured')}</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t('courses.highlightedOnHomepage')}
                  </p>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
