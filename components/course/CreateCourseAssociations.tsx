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
import { CourseCreateFormData } from './useCourseCreate';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
  categories: Array<{ id: number; name: string }>;
};

const CreateCourseAssociations = ({ form, categories }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Associations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="season_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Season ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Season ID (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="audio_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Audio ID (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="video_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Video ID (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Image ID (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateCourseAssociations;
