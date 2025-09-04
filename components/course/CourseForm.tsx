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
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter course title (min 5 characters)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p
                    className={`text-sm ${(field.value?.length || 0) >= 70 ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    Title must be between 5 and 80 characters (
                    {field.value?.length || 0}/80)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter course description"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                  <p
                    className={`text-sm ${(field.value?.length || 0) >= 350 ? 'text-orange-600' : 'text-gray-600'}`}
                  >
                    Description must be less than 400 characters (
                    {field.value?.length || 0}/400)
                  </p>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadPreview
              title={form.watch('title') || initialValues.title}
              description={
                form.watch('description') || initialValues.description
              }
              onSuccess={(imageId) => {
                form.setValue('cover_id', imageId);
              }}
              selectedImageId={form.watch('cover_id')}
              alt="Course cover preview"
              placeholderText="No cover image selected"
              placeholderSubtext="Upload an image to preview it here"
              uploadButtonText="Upload Cover Image"
              selectButtonText="Select an image first"
            />
          </CardContent>
        </Card>

        {/* Pricing */}
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

        {/* Associations */}
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
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                name="cover_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Cover ID (optional)"
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
