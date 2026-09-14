'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Course } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCategoriesStore } from '@/lib/store';
import { useAutoSelect } from '@/hooks/useAutoSelect';

type Props = {
  form: UseFormReturn<ProductCreateFormData>;
};

const CreateProductAssociations = ({ form }: Props) => {
  const { t } = useTranslation();
  const { categories, isLoading: categoriesLoading } = useCategoriesStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (categoryId?: string) => {
    if (!categoryId) {
      setCourses([]);
      return;
    }

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

  // Watch category_id to filter courses
  const selectedCategoryId = form.watch('category_id');

  // Fetch courses when category changes
  useEffect(() => {
    fetchCourses(selectedCategoryId);
  }, [selectedCategoryId, fetchCourses]);

  const productCategories = categories
    .filter((category) => category.is_active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type
    }));

  const categoryOptions = productCategories.map((c) => ({
    value: c.id.toString()
  }));
  useAutoSelect(
    categoryOptions,
    (value) => form.setValue('category_id', value),
    form.watch('category_id')
  );

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
        <CardTitle>{t('products.associations')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>{t('products.category')}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === 'none' ? '' : value);
                    form.setValue('course_ids', []);
                  }}
                  value={field.value || 'none'}
                  disabled={categoriesLoading || productCategories.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? t('common.loading')
                            : t('products.selectCategory')
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!categoriesLoading && productCategories.length > 0 && (
                      <>
                        <SelectItem value="none">{t('common.none')}</SelectItem>
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
            {t('products.relatedCourses')}
            {selectedCategoryId && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({t('products.filteredByCategory')})
              </span>
            )}
          </FormLabel>
          <div className="rounded-lg border border-border p-4">
            {!selectedCategoryId ? (
              <p className="text-sm text-muted-foreground">
                {t('products.selectCategoryFirst')}
              </p>
            ) : coursesLoading ? (
              <p className="text-sm text-muted-foreground">
                {t('common.loading')}
              </p>
            ) : coursesError ? (
              <p className="text-sm text-red-500">{coursesError}</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('products.noCoursesInCategory')}
              </p>
            ) : (
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {courses.map((course) => {
                  const isSelected = courseIds.includes(course.id.toString());
                  return (
                    <label
                      key={course.id}
                      className="flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleCourseToggle(course.id.toString())
                        }
                        className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-foreground">
                        {course.title}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {courseIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {courseIds.length}{' '}
              {courseIds.length === 1
                ? t('courses.course')
                : t('courses.courses')}{' '}
              {t('common.selected')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateProductAssociations;
