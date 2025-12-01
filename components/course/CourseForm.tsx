'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CourseFormData, courseFormSchema } from './schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  initialValues: CourseFormData;
  categories: Array<{ id: number; name: string }>;
  isSubmitting: boolean;
  onSubmit: (data: CourseFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
};

const CourseForm = ({
  initialValues,
  categories,
  isSubmitting,
  onSubmit,
  onCancel,
  submitLabel = 'Save'
}: Props) => {
  const { t } = useTranslation();
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('courses.basicInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.courseTitle')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('courses.enterCourseTitle')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p
                    className={`text-sm ${(field.value?.length || 0) >= 70 ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    {t('courses.titleLength')} ({field.value?.length || 0}/80)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.description')} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('courses.enterDescription')}
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                  <p
                    className={`text-sm ${(field.value?.length || 0) >= 350 ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    {t('courses.descriptionLength')} ({field.value?.length || 0}
                    /400)
                  </p>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>{t('courses.coverImage')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadPreview
              title={form.watch('title') || initialValues.title}
              description={
                form.watch('description') || initialValues.description
              }
              onSuccess={(image) => {
                form.setValue('cover_id', image.id.toString());
              }}
              selectedImageId={form.watch('cover_id')}
              alt={t('courses.courseCoverPreview')}
              placeholderText={t('courses.noCoverImageSelected')}
              placeholderSubtext={t('courses.uploadImageToPreview')}
              uploadButtonText={t('courses.uploadCoverImage')}
              selectButtonText={t('courses.selectImageFirst')}
            />
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>{t('courses.pricing')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primary_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.primaryPrice')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={t('courses.pricePlaceholder')}
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
                    <FormLabel>{t('courses.secondaryPrice')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={t('courses.pricePlaceholder')}
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
              {t('courses.enterWholeNumbers')}
            </p>
          </CardContent>
        </Card>

        {/* Associations */}
        <Card>
          <CardHeader>
            <CardTitle>{t('courses.contentAssociations')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.category')}</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('courses.selectCategory')}
                          />
                        </SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="season_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.seasonId')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('courses.seasonIdPlaceholder')}
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
                    <FormLabel>{t('courses.audioId')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('courses.audioIdPlaceholder')}
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
                    <FormLabel>{t('courses.videoId')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('courses.videoIdPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('courses.coverId')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('courses.coverIdPlaceholder')}
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

        {/* Publish Settings */}
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

        {/* Featured Flag */}
        <Card>
          <CardHeader>
            <CardTitle>Discovery</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Course</FormLabel>
                    <div className="text-sm text-gray-500">
                      Highlight this course in featured sections
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

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? 'Updating...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
