import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProductCreateFormData } from './useProductCreate';
import { apiClient } from '@/lib/api';
import { Category, Course } from '@/types/api';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductAssociations = ({ form }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const hasFetchedCategories = useRef(false);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await apiClient.getCategories();

      let categoriesData: Category[] = [];

      // Handle different response structures
      if (Array.isArray(response)) {
        categoriesData = response as Category[];
      } else if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        categoriesData = response.data as Category[];
      } else if (
        response &&
        typeof response === 'object' &&
        Array.isArray(response)
      ) {
        categoriesData = response as Category[];
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
  }, []);

  const fetchCourses = useCallback(async (categoryId?: string) => {
    try {
      setCoursesLoading(true);
      setCoursesError(null);

      const params: { limit: number; category_id?: number } = { limit: 100 };
      if (categoryId && categoryId.trim()) {
        params.category_id = Number(categoryId);
      }

      const response = await apiClient.getCourses(params);

      let coursesData: Course[] = [];

      if (
        response &&
        typeof response === 'object' &&
        'courses' in response &&
        Array.isArray(response.courses)
      ) {
        coursesData = response.courses as Course[];
      } else if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        coursesData = response.data as Course[];
      } else if (Array.isArray(response)) {
        coursesData = response as Course[];
      } else {
        coursesData = [];
      }

      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCoursesError('Failed to fetch courses');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedCategories.current && categories.length === 0) {
      hasFetchedCategories.current = true;
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Watch category_id to filter courses
  const selectedCategoryId = form.watch('category_id');

  // Fetch courses when category changes
  useEffect(() => {
    fetchCourses(selectedCategoryId);
  }, [selectedCategoryId, fetchCourses]);

  // Filter categories - show all active categories (products can use any category type)
  // or filter by a specific type if needed. For now, show all active categories.
  const productCategories = categories
    .filter((category) => category.is_active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type
    }));

  const courseIds = form.watch('course_ids') || [];

  const handleCourseToggle = (courseId: string) => {
    const currentIds = courseIds;
    const isSelected = currentIds.includes(courseId);

    if (isSelected) {
      form.setValue(
        'course_ids',
        currentIds.filter((id: string) => id !== courseId)
      );
    } else {
      form.setValue('course_ids', [...currentIds, courseId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Clear selected courses when category changes
                    form.setValue('course_ids', []);
                  }}
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
                    ) : productCategories.length === 0 ? (
                      <SelectItem value="" disabled>
                        {categoriesError || 'No categories available'}
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="">None</SelectItem>
                        {productCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>
            Related Courses
            {selectedCategoryId && (
              <span className="ml-2 text-xs font-normal text-slate-500">
                (filtered by selected category)
              </span>
            )}
          </FormLabel>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            {!selectedCategoryId ? (
              <p className="text-sm text-slate-500">
                Please select a category first to see related courses
              </p>
            ) : coursesLoading ? (
              <p className="text-sm text-slate-500">Loading courses...</p>
            ) : coursesError ? (
              <p className="text-sm text-red-500">{coursesError}</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No courses available in this category
              </p>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {courses.map((course) => {
                  const isSelected = courseIds.includes(course.id.toString());
                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleCourseToggle(course.id.toString())
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {course.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {courseIds.length > 0 && (
            <p className="text-xs text-slate-500">
              {courseIds.length} course{courseIds.length !== 1 ? 's' : ''}{' '}
              selected
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateProductAssociations;
