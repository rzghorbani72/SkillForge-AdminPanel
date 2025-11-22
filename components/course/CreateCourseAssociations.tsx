import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';

type Props = {
  form: UseFormReturn<CourseCreateFormData>;
};

const CreateCourseAssociations = ({ form }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const hasFetchedCategories = useRef(false);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await apiClient.getCategories();

      let categoriesData: Category[] = [];

      if (
        response &&
        typeof response === 'object' &&
        Array.isArray(response.data)
      ) {
        categoriesData = response.data as Category[];
      } else {
        categoriesData = [];
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []); // Empty dependency array - store functions are stable

  useEffect(() => {
    if (!hasFetchedCategories.current && categories.length === 0) {
      hasFetchedCategories.current = true;
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

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
