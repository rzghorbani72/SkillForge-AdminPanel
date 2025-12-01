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
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductPricing = ({ form }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('products.pricing')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('products.price')} *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={t('products.pricePlaceholder')}
                  {...field}
                  min="0"
                  max="999999999"
                  step="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="original_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('products.originalPrice')} ({t('products.forDiscount')})
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder={t('products.originalPricePlaceholder')}
                  {...field}
                  min="0"
                  max="999999999"
                  step="1"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-600">
                {t('products.originalPriceDescription')}
              </p>
            </FormItem>
          )}
        />

        <p className="text-sm text-gray-600">
          {t('products.enterWholeNumbers')}
        </p>
      </CardContent>
    </Card>
  );
};

export default CreateProductPricing;
