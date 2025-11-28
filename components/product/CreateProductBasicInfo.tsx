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

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductBasicInfo = ({ form }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product title (min 5 characters)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p
                className={`text-sm ${(field.value?.length || 0) >= 70 ? 'text-orange-600' : 'text-gray-600'}`}
              >
                Title must be between 5 and 80 characters (
                {field.value?.length || 0}/80)
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief product description (optional)"
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-600">
                Short description (max 400 characters) -{' '}
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
