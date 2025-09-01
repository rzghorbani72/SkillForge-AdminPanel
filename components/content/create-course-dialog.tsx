'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
  FormDescription,
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
import { FileUploader } from '@/components/file-uploader';
import {
  Plus,
  Upload,
  Tag,
  DollarSign,
  Clock,
  Globe,
  Target,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';

// Meta tag schema to match backend DTO
const metaTagSchema = z.object({
  title: z.string().min(1, 'Meta tag title is required'),
  content: z.string().min(1, 'Meta tag content is required')
});

const courseFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(400, 'Description must be less than 400 characters'),
  short_description: z
    .string()
    .min(10, 'Short description must be at least 10 characters')
    .max(500, 'Short description must be less than 500 characters'),
  meta_tags: z
    .array(metaTagSchema)
    .default([{ title: 'keywords', content: '' }]),
  primary_price: z
    .string()
    .min(1, 'Primary price is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Primary price must be a valid number greater than or equal to 0'
    }),
  secondary_price: z
    .string()
    .min(1, 'Secondary price is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message:
        'Secondary price must be a valid number greater than or equal to 0'
    }),
  currency: z.enum(['USD', 'IRR', 'TL', 'EUR', 'GBP']).default('USD'),
  category_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  image_id: z.string().optional(),
  published: z.boolean().default(false),
  difficulty: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .default('BEGINNER'),
  duration: z.string().optional(),
  language: z.string().default('en'),
  requirements: z.string().optional(),
  learning_outcomes: z.string().optional(),
  cover_image: z.any().optional(),
  course_type: z
    .enum(['LIVE', 'SELF_PACED', 'HYBRID', 'WORKSHOP', 'CERTIFICATION'])
    .default('SELF_PACED'),
  max_students: z.string().optional(),
  provides_certificate: z.boolean().default(false),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CreateCourseDialogProps {
  onCourseCreated?: () => void;
  categories: Category[];
  schoolId: number;
}

// Predefined meta tag options for better UX
const PREDEFINED_META_TAGS = [
  { title: 'keywords', content: '' },
  { title: 'author', content: '' },
  { title: 'description', content: '' },
  { title: 'robots', content: 'index, follow' },
  { title: 'og:title', content: '' },
  { title: 'og:description', content: '' },
  { title: 'twitter:card', content: 'summary_large_image' }
];

export default function CreateCourseDialog({
  onCourseCreated,
  categories,
  schoolId
}: CreateCourseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metaTags, setMetaTags] = useState([
    { title: 'keywords', content: '' }
  ]);
  const [coverImageId, setCoverImageId] = useState<number | undefined>();
  const { selectedSchool } = useSchool();

  // Get default currency based on school location or preferences
  const getDefaultCurrency = () => {
    if (!selectedSchool) return 'USD';

    // You can extend this logic based on school location or preferences
    const schoolName = selectedSchool.name.toLowerCase();
    if (
      schoolName.includes('iran') ||
      schoolName.includes('persian') ||
      schoolName.includes('فارسی')
    ) {
      return 'IRR';
    } else if (
      schoolName.includes('turkey') ||
      schoolName.includes('turkish') ||
      schoolName.includes('türk')
    ) {
      return 'TL';
    } else if (schoolName.includes('europe') || schoolName.includes('euro')) {
      return 'EUR';
    } else if (schoolName.includes('uk') || schoolName.includes('british')) {
      return 'GBP';
    }

    return 'USD'; // Default fallback
  };

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      meta_tags: [{ title: 'keywords', content: '' }],
      primary_price: '0',
      secondary_price: '0',
      currency: getDefaultCurrency(),
      published: false,
      difficulty: 'BEGINNER',
      language: 'en',
      requirements: '',
      learning_outcomes: '',
      duration: '',
      category_id: '',
      season_id: '',
      audio_id: '',
      video_id: '',
      image_id: ''
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

  const addPredefinedMetaTag = (tag: { title: string; content: string }) => {
    if (!metaTags.find((t) => t.title === tag.title)) {
      setMetaTags([...metaTags, { ...tag }]);
    }
  };

  const handleCoverImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      try {
        const file = files[0];
        const uploadResponse = await apiClient.uploadImage(file, {
          title: `Course Cover: ${form.getValues('title') || 'Untitled Course'}`,
          description: `Cover image for course: ${form.getValues('title') || 'Untitled Course'}`
        });
        const responseData = uploadResponse.data as any;
        setCoverImageId(responseData.id);
        ErrorHandler.showSuccess('Cover image uploaded successfully');
      } catch (error) {
        console.error('Error uploading cover image:', error);
        ErrorHandler.handleApiError(error);
      }
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);

      // Comprehensive client-side validation
      const validationErrors: string[] = [];

      if (!data.title.trim() || data.title.trim().length < 5) {
        validationErrors.push('Title must be at least 5 characters long');
      }

      if (!data.description.trim()) {
        validationErrors.push('Description is required');
      }

      if (
        !data.short_description.trim() ||
        data.short_description.trim().length < 10
      ) {
        validationErrors.push(
          'Short description must be at least 10 characters long'
        );
      }

      if (
        !data.primary_price ||
        isNaN(parseFloat(data.primary_price)) ||
        parseFloat(data.primary_price) < 0
      ) {
        validationErrors.push(
          'Primary price must be a valid number greater than or equal to 0'
        );
      }

      if (
        !data.secondary_price ||
        isNaN(parseFloat(data.secondary_price)) ||
        parseFloat(data.secondary_price) < 0
      ) {
        validationErrors.push(
          'Secondary price must be a valid number greater than or equal to 0'
        );
      }

      if (validationErrors.length > 0) {
        ErrorHandler.showWarning(
          `Please fix the following errors:\n${validationErrors.join('\n')}`
        );
        return;
      }

      // Prepare meta tags
      const validMetaTags = metaTags.filter((tag) => tag.title && tag.content);

      // Create course with backend DTO structure - ensure all required fields are properly typed
      const courseData = {
        title: data.title.trim(),
        description: data.description.trim(),
        meta_tags: validMetaTags,
        primary_price: Number(data.primary_price),
        secondary_price: Number(data.secondary_price),
        currency: data.currency,
        category_id: data.category_id ? Number(data.category_id) : undefined,
        season_id: data.season_id ? Number(data.season_id) : undefined,
        audio_id: data.audio_id ? Number(data.audio_id) : undefined,
        video_id: data.video_id ? Number(data.video_id) : undefined,
        image_id:
          coverImageId || (data.image_id ? Number(data.image_id) : undefined),
        published: Boolean(data.published),
        course_type: data.course_type,
        max_students: data.max_students ? Number(data.max_students) : undefined,
        provides_certificate: Boolean(data.provides_certificate),
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined
      };

      console.log('Creating course with data:', courseData);
      console.log('Data types:', {
        title: typeof courseData.title,
        primary_price: typeof courseData.primary_price,
        secondary_price: typeof courseData.secondary_price,
        published: typeof courseData.published
      });
      console.log('Raw form data:', data);
      await apiClient.createCourse(courseData);

      form.reset();
      setMetaTags([{ title: 'keywords', content: '' }]);
      setCoverImageId(undefined);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Create a comprehensive course with all necessary details and media.
            Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form Validation Status */}
            <div className="rounded-md border-2 border-dashed p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${form.formState.isValid ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  <span className="text-sm font-medium">
                    Form Status:{' '}
                    {form.formState.isValid ? 'Valid ✓' : 'Invalid ✗'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {Object.keys(form.formState.errors).length} validation errors
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <BookOpen className="h-5 w-5" />
                Basic Information *
              </h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter course title (5-80 characters)"
                        {...field}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          // Real-time validation feedback
                          if (value.length < 5) {
                            e.target.setCustomValidity(
                              `Title must be at least 5 characters (${value.length}/5)`
                            );
                          } else if (value.length > 80) {
                            e.target.setCustomValidity(
                              `Title must be less than 80 characters (${value.length}/80)`
                            );
                          } else {
                            e.target.setCustomValidity('');
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Title must be between 5 and 80 characters - Required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief overview of the course (10-500 characters)"
                        {...field}
                        rows={2}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          // Real-time validation feedback
                          if (value.length < 10) {
                            e.target.setCustomValidity(
                              `Short description must be at least 10 characters (${value.length}/10)`
                            );
                          } else if (value.length > 500) {
                            e.target.setCustomValidity(
                              `Short description must be less than 500 characters (${value.length}/500)`
                            );
                          } else {
                            e.target.setCustomValidity('');
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      A concise summary that appears in course listings -
                      Required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed course description (max 400 characters)"
                        {...field}
                        rows={4}
                        required
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                          // Real-time validation feedback
                          if (value.length === 0) {
                            e.target.setCustomValidity(
                              'Description is required'
                            );
                          } else if (value.length > 400) {
                            e.target.setCustomValidity(
                              `Description must be less than 400 characters (${value.length}/400)`
                            );
                          } else {
                            e.target.setCustomValidity('');
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Comprehensive description of course content and objectives
                      - Required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Course Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Course Details</h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 120"
                          {...field}
                          min="0"
                        />
                      </FormControl>
                      <FormDescription>
                        Total course duration in minutes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fa">فارسی</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="tr">Türkçe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Course Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="course_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LIVE">Live Course</SelectItem>
                          <SelectItem value="SELF_PACED">Self-Paced</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                          <SelectItem value="WORKSHOP">Workshop</SelectItem>
                          <SelectItem value="CERTIFICATION">
                            Certification
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the course will be delivered
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Students</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100 (0 = unlimited)"
                          {...field}
                          min="0"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of students allowed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Course Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When the course becomes available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When the course expires (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <DollarSign className="h-5 w-5" />
                Pricing *
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primary_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          min="0"
                          step="0.01"
                          required
                          className="w-full"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            console.log('Primary price changed:', value); // Debug log
                            // Real-time validation feedback
                            if (value === '') {
                              e.target.setCustomValidity(
                                'Primary price is required'
                              );
                            } else if (
                              isNaN(parseFloat(value)) ||
                              parseFloat(value) < 0
                            ) {
                              e.target.setCustomValidity(
                                'Primary price must be a valid number >= 0'
                              );
                            } else {
                              e.target.setCustomValidity('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Main course price - Required
                      </FormDescription>
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
                          placeholder="0"
                          {...field}
                          min="0"
                          step="0.01"
                          required
                          className="w-full"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            console.log('Secondary price changed:', value); // Debug log
                            // Real-time validation feedback
                            if (value === '') {
                              e.target.setCustomValidity(
                                'Secondary price is required'
                              );
                            } else if (
                              isNaN(parseFloat(value)) ||
                              parseFloat(value) < 0
                            ) {
                              e.target.setCustomValidity(
                                'Secondary price must be a valid number >= 0'
                              );
                            } else {
                              e.target.setCustomValidity('');
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Original/discount price - Required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="IRR">IRR (تومان)</SelectItem>
                          <SelectItem value="TL">TL (₺)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Currency for course pricing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600">
                <strong>Note:</strong> Both primary and secondary prices are
                required fields. Set primary price as the main selling price and
                secondary price as the original/discount price. Currency can be
                selected based on your school's location and target market.
              </div>

              {/* Debug info */}
              <div className="rounded bg-gray-100 p-2 text-xs text-gray-500">
                <strong>Debug:</strong> Primary: "{form.watch('primary_price')}
                ", Secondary: "{form.watch('secondary_price')}"
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <ImageIcon className="h-5 w-5" />
                Cover Image
              </h3>

              <div className="space-y-3">
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleCoverImageUpload(Array.from(files));
                      }
                    }}
                  />
                  <FormDescription>
                    Upload a cover image for your course (max 5MB). Supported
                    formats: PNG, JPG, JPEG, WebP
                  </FormDescription>
                </div>
                {coverImageId && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ImageIcon className="h-4 w-4" />
                    Cover image uploaded successfully (ID: {coverImageId})
                  </div>
                )}
              </div>
            </div>

            {/* Learning Content */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Target className="h-5 w-5" />
                Learning Content
              </h3>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites & Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What students should know before taking this course..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      List any prerequisites, software, or knowledge required
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="learning_outcomes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Outcomes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What students will learn from this course..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Specific skills and knowledge students will gain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Meta Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium">
                  <Tag className="h-5 w-5" />
                  Meta Tags (SEO)
                </h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMetaTag}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Tag
                  </Button>
                </div>
              </div>

              {/* Predefined Meta Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Quick Add Common Tags:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_META_TAGS.map((tag) => (
                    <Button
                      key={tag.title}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPredefinedMetaTag(tag)}
                      disabled={!!metaTags.find((t) => t.title === tag.title)}
                    >
                      {tag.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Meta Tags */}
              <div className="space-y-3">
                {metaTags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Tag title (e.g., keywords, author)"
                      value={tag.title}
                      onChange={(e) =>
                        updateMetaTag(index, 'title', e.target.value)
                      }
                      className="flex-1"
                    />
                    <Input
                      placeholder="Tag content"
                      value={tag.content}
                      onChange={(e) =>
                        updateMetaTag(index, 'content', e.target.value)
                      }
                      className="flex-1"
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
                      <FormLabel>Season</FormLabel>
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
                      <FormLabel>Additional Image ID</FormLabel>
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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publish Course
                        </FormLabel>
                        <FormDescription>
                          Make this course visible to students immediately
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name="provides_certificate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Provide Certificate
                        </FormLabel>
                        <FormDescription>
                          Students will receive a certificate upon completion
                        </FormDescription>
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
            </div>

            <DialogFooter>
              <div className="flex w-full flex-col space-y-3">
                {/* Form Validation Summary */}
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  <strong>Required Fields:</strong> Title (5-80 chars),
                  Description (max 400 chars), Short Description (10-500 chars),
                  Primary Price, Secondary Price, Currency
                  <br />
                  <strong>Optional Fields:</strong> Course Type, Max Students,
                  Dates, Certificate, Requirements, Learning Outcomes
                </div>

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
