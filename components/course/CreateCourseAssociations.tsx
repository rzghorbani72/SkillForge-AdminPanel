import React, { useEffect } from 'react';
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
import { useCategoriesStore } from '@/lib/store';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
};

const CreateCourseAssociations = ({ form }: Props) => {
  const {
    categories,
    fetchCategories,
    isLoading: categoriesLoading
  } = useCategoriesStore();

  // Ensure categories are loaded
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      fetchCategories();
    }
  }, [categories.length, categoriesLoading, fetchCategories]);

  // Filter categories to only show COURSE type and active ones, format for dropdown
  const courseCategories = categories
    .filter((category) => category.type === 'COURSE' && category.is_active)
    .map((category) => ({
      id: category.id,
      name: category.name
    }));
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? 'Loading categories...'
                            : 'Select category'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : courseCategories.length === 0 ? (
                      <SelectItem value="" disabled>
                        {categoriesError || 'No categories available'}
                      </SelectItem>
                    ) : (
                      courseCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
