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

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductPricing = ({ form }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0 (0-999,999,999)"
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
              <FormLabel>Original Price (for discount)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Optional - higher than price for discount"
                  {...field}
                  min="0"
                  max="999999999"
                  step="1"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-gray-600">
                If set, must be higher than price to show discount
              </p>
            </FormItem>
          )}
        />

        <p className="text-sm text-gray-600">
          Enter whole numbers between 0 and 999,999,999
        </p>
      </CardContent>
    </Card>
  );
};

export default CreateProductPricing;
