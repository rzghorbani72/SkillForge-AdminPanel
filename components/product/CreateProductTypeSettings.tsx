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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductTypeSettings = ({ form }: Props) => {
  const { t } = useTranslation();
  const productType = form.watch('product_type');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('products.productTypeInventory')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="product_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('products.productType')} *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('products.selectProductType')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DIGITAL">
                    {t('products.digitalProduct')}
                  </SelectItem>
                  <SelectItem value="PHYSICAL">
                    {t('products.physicalProduct')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {productType === 'PHYSICAL' && (
          <>
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.stockQuantity')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={t('products.enterAvailableStock')}
                      {...field}
                      min="0"
                      step="1"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-600">
                    {t('products.leaveEmptyForUnlimited')}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.weight')} (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={t('products.enterWeightInKg')}
                      {...field}
                      min="0"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.dimensions')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('products.dimensionsPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateProductTypeSettings;
