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
import { CourseCreateFormData } from './useCourseCreate';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
};

const CreateCoursePricing = ({ form }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="primary_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00 (0-999,999.99)"
                    {...field}
                    min="0"
                    max="999999.99"
                    step="0.01"
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
                <FormLabel>Secondary Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00 (0-999,999.99)"
                    {...field}
                    min="0"
                    max="999999.99"
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-sm text-gray-600">
          Prices must be between 0 and 999,999.99
        </p>
      </CardContent>
    </Card>
  );
};

export default CreateCoursePricing;
