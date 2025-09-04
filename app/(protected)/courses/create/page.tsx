'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';

// Schema with proper validation for all required fields
const courseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(400, 'Description must be less than 400 characters'),
  primary_price: z
    .string()
    .min(1, 'Primary price is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999.99;
    }, 'Primary price must be a valid number between 0 and 999,999.99'),
  secondary_price: z
    .string()
    .min(1, 'Secondary price is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 999999.99;
    }, 'Secondary price must be a valid number between 0 and 999,999.99'),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  image_id: z.string().optional(),
  published: z.boolean().default(false)
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      primary_price: '0.00',
      secondary_price: '0.00',
      category_id: '',
      season_id: '',
      audio_id: '',
      video_id: '',
      image_id: '',
      published: false
    }
  });

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    if (!selectedSchool) {
      ErrorHandler.showError('Please select a school first');
      return;
    }

    try {
      setIsLoading(true);

      // Validate required fields
      if (!data.title.trim() || data.title.trim().length < 5) {
        ErrorHandler.showError('Title must be at least 5 characters long');
        return;
      }

      if (!data.primary_price || !data.secondary_price) {
        ErrorHandler.showError(
          'Both primary and secondary prices are required'
        );
        return;
      }

      const primaryPrice = Number(data.primary_price);
      const secondaryPrice = Number(data.secondary_price);

      if (isNaN(primaryPrice) || isNaN(secondaryPrice)) {
        ErrorHandler.showError('Prices must be valid numbers');
        return;
      }

      if (
        primaryPrice < 0 ||
        primaryPrice > 999999.99 ||
        secondaryPrice < 0 ||
        secondaryPrice > 999999.99
      ) {
        ErrorHandler.showError('Prices must be between 0 and 999,999.99');
        return;
      }

      // Create course with API-expected data structure
      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        primary_price: primaryPrice,
        secondary_price: secondaryPrice,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        season_id: data.season_id ? Number(data.season_id) : undefined,
        audio_id: data.audio_id ? Number(data.audio_id) : undefined,
        video_id: data.video_id ? Number(data.video_id) : undefined,
        image_id: data.image_id ? Number(data.image_id) : undefined,
        published: !!data.published
      };

      await apiClient.createCourse(courseData);
      ErrorHandler.showSuccess('Course created successfully');
      router.push('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to create courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Course
            </h1>
            <p className="text-muted-foreground">
              Create a new course for {selectedSchool.name}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
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
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="cursor-pointer"
                />

                {coverPreview && (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="aspect-[5/4] w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={coverPreview}
                          alt="Course cover preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeCoverImage}
                        className="absolute right-2 top-2"
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cover image selected: {coverImage?.name}
                    </p>
                  </div>
                )}

                {!coverPreview && (
                  <div className="flex aspect-[5/4] w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      No cover image selected
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload an image to preview it here
                    </p>
                  </div>
                )}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                        <FormLabel className="text-base">
                          Publish Course
                        </FormLabel>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
