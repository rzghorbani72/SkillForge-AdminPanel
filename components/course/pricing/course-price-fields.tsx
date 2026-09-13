'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { PriceInput } from '@/components/ui/price-input';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CourseFormData } from '../schema';

/**
 * The course's own price — the selling way every course has by default. It lives
 * on the course record, so it is edited through the course form and saved with
 * the rest of the page, unlike the extra offers next to it.
 */
export function CoursePriceFields({
  form
}: {
  form: UseFormReturn<CourseFormData>;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        control={form.control}
        name="primary_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              {t('courses.salePrice')} *
            </FormLabel>
            <FormControl>
              <PriceInput
                placeholder="0"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                className="h-9"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="secondary_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              {t('courses.priceBeforeDiscount')}
            </FormLabel>
            <FormControl>
              <PriceInput
                placeholder="0"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                className="h-9"
              />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              {t('courses.priceBeforeDiscountHint')}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
