'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PriceInput } from '@/components/ui/price-input';
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
                <PriceInput
                  placeholder={t('products.pricePlaceholder')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
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
                <PriceInput
                  placeholder={t('products.originalPricePlaceholder')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                {t('products.originalPriceDescription')}
              </p>
            </FormItem>
          )}
        />

        <p className="text-sm text-muted-foreground">{t('products.enterWholeNumbers')}</p>
      </CardContent>
    </Card>
  );
};

export default CreateProductPricing;
