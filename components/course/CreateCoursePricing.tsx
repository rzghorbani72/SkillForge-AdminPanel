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
            name="secondary_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Price *</FormLabel>
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
        </div>
        <p className="text-sm text-gray-600">
          Enter whole numbers between 0 and 999,999,999
        </p>
      </CardContent>
    </Card>
  );
};

export default CreateCoursePricing;
