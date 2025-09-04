import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { CourseCreateFormData } from './useCourseCreate';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
};

const CreateCoursePublishSettings = ({ form }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Course</FormLabel>
                <div className="text-sm text-gray-500">
                  Make this course visible to students immediately
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
  );
};

export default CreateCoursePublishSettings;
