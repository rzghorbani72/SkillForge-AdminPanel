'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Plus, Tag, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
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

interface CreateCourseDialogProps {
  onCourseCreated?: () => void;
  schoolId: number;
}

export default function CreateCourseDialog({
  onCourseCreated,
  schoolId
}: CreateCourseDialogProps) {
  const { categories } = useCategoriesStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metaTags, setMetaTags] = useState([
    { title: 'keywords', content: '' }
  ]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset();
      setMetaTags([{ title: 'keywords', content: '' }]);
      setCoverImage(null);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
    }
  };

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

  const addMetaTag = () => {
    setMetaTags([...metaTags, { title: '', content: '' }]);
  };

  const removeMetaTag = (index: number) => {
    setMetaTags(metaTags.filter((_, i) => i !== index));
  };

  const updateMetaTag = (
    index: number,
    field: 'title' | 'content',
    value: string
  ) => {
    const newMetaTags = [...metaTags];
    newMetaTags[index][field] = value;
    setMetaTags(newMetaTags);
  };

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
    try {
      setIsLoading(true);

      // Prepare meta tags - filter out empty ones
      const validMetaTags = metaTags.filter(
        (tag) => tag.title.trim() && tag.content.trim()
      );

      // Validate required fields
      if (!data.title.trim() || data.title.trim().length < 5) {
        toast.error('Title must be at least 5 characters long');
        return;
      }

      if (!data.primary_price || !data.secondary_price) {
        toast.error('Both primary and secondary prices are required');
        return;
      }

      const primaryPrice = Number(data.primary_price);
      const secondaryPrice = Number(data.secondary_price);

      if (isNaN(primaryPrice) || isNaN(secondaryPrice)) {
        toast.error('Prices must be valid numbers');
        return;
      }

      if (
        primaryPrice < 0 ||
        primaryPrice > 999999.99 ||
        secondaryPrice < 0 ||
        secondaryPrice > 999999.99
      ) {
        toast.error('Prices must be between 0 and 999,999.99');
        return;
      }

      // Validate meta tags
      if (validMetaTags.length > 0) {
        for (const tag of validMetaTags) {
          if (!tag.title.trim() || tag.title.trim().length < 1) {
            toast.error('Meta tag titles cannot be empty');
            return;
          }
          if (!tag.content.trim() || tag.content.trim().length < 1) {
            toast.error('Meta tag content cannot be empty');
            return;
          }
        }
      }

      // Ensure we have at least one valid meta tag
      if (validMetaTags.length === 0) {
        validMetaTags.push({
          title: 'keywords',
          content: 'course, education, learning'
        });
      }

      // Create course with API-expected data structure
      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        meta_tags: validMetaTags,
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

      form.reset();
      setMetaTags([{ title: 'keywords', content: '' }]);
      setCoverImage(null);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      setIsOpen(false);
      onCourseCreated?.();
      ErrorHandler.showSuccess('Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Create a new course with basic information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

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
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cover Image</h3>

              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="cursor-pointer"
                />

                {coverPreview && (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="aspect-[5/4] w-full overflow-hidden rounded-lg border border-gray-200">
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
                  <div className="flex aspect-[5/4] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      No cover image selected
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload an image to preview it here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>

              <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Meta Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Meta Tags</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetaTag}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
              </div>

              <div className="space-y-3">
                {metaTags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Tag title (e.g., keywords)"
                      value={tag.title}
                      onChange={(e) =>
                        updateMetaTag(index, 'title', e.target.value)
                      }
                      className="flex-1"
                      maxLength={50}
                    />
                    <Input
                      placeholder="Tag content"
                      value={tag.content}
                      onChange={(e) =>
                        updateMetaTag(index, 'content', e.target.value)
                      }
                      className="flex-1"
                      maxLength={200}
                    />
                    {metaTags.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMetaTag(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-sm text-gray-600">
                  Meta tags help with SEO. Title max 50 chars, content max 200
                  chars.
                </p>
              </div>
            </div>

            {/* Associations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Content Associations</h3>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
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
            </div>

            {/* Publish Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Publish Settings</h3>

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
            </div>

            <DialogFooter>
              <div className="w-full space-y-2">
                {!form.formState.isValid && (
                  <p className="text-center text-sm text-red-600">
                    Please fill in all required fields correctly
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isValid}
                  className="w-full"
                >
                  {isLoading ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
