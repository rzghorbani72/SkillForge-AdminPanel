'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { PriceInput } from '@/components/ui/price-input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { CourseFormData } from './schema';
import { Tag, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<CourseFormData>;
};

export default function CreateCoursePricing({ form }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.pricing')}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('courses.pricingHint')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Sale price */}
            <div className="w-full max-w-[17rem] space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-medium">
                  {t('courses.primaryPrice')}
                </span>
              </div>
              <FormField
                control={form.control}
                name="primary_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      {t('courses.amount')} *
                    </FormLabel>
                    <FormControl>
                      <PriceInput
                        placeholder="0"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        suffix={t('courses.toman')}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Original / crossed-out price */}
            <div className="w-full max-w-[17rem] space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {t('courses.secondaryPrice')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('courses.shownCrossedOut')}
                </span>
              </div>
              <FormField
                control={form.control}
                name="secondary_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      {t('courses.amount')}
                    </FormLabel>
                    <FormControl>
                      <PriceInput
                        placeholder="0"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        suffix={t('courses.toman')}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.courseSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
