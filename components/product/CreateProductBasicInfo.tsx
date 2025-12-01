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
import { ProductCreateFormData } from './useProductCreate';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductBasicInfo = ({ form }: Props) => {
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
              <FormLabel>{t('products.productTitle')} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('products.enterProductTitle')}
                  {...field}
                />
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
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('products.shortDescription')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('products.briefDescription')}
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-600">
                {t('products.shortDescriptionLength')} -{' '}
                {field.value?.length || 0}/400
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed product description"
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormMessage />
              <p
                className={`text-sm ${(field.value?.length || 0) >= 1800 ? 'text-orange-600' : 'text-gray-600'}`}
              >
                Description must be less than 2000 characters (
                {field.value?.length || 0}/2000)
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <FormControl>
                <Input placeholder="Enter SKU (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default CreateProductBasicInfo;
