'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  FormMessage,
  FormDescription
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
import { ArrowLeft, Plus, Image as ImageIcon, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';
import { toast } from 'sonner';

// Schema based on CreateLessonDto
const lessonFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be less than 80 characters'),
  description: z
    .string()
    .max(400, 'Description must be less than 400 characters')
    .optional(),
  season_id: z.string().min(1, 'Season is required'),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  image_id: z.string().optional(),
  document_id: z.string().optional(),
  category_id: z.string().optional(),
  published: z.boolean().default(false),
  is_free: z.boolean().default(false),
  lesson_type: z.enum(['VIDEO', 'AUDIO', 'TEXT', 'QUIZ']).default('VIDEO')
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

export default function CreateLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [season, setSeason] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      season_id: seasonId,
      audio_id: '',
      video_id: '',
      image_id: '',
      document_id: '',
      category_id: '',
      published: false,
      is_free: false,
      lesson_type: 'VIDEO'
    }
  });

  // Fetch season and course data
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSchool) return;

      try {
        const [seasonResponse, courseResponse] = await Promise.all([
          apiClient.getSeason(parseInt(seasonId)),
          apiClient.getCourse(parseInt(courseId))
        ]);

        if (seasonResponse) {
          setSeason(seasonResponse);
        }

        if (courseResponse) {
          setCourse(courseResponse);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        ErrorHandler.handleApiError(error);
      }
    };

    if (courseId && seasonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, selectedSchool]);

  const onSubmit = async (data: LessonFormData) => {
    if (!selectedSchool) {
      toast.error('Please select a school first');
      return;
    }

    setIsLoading(true);

    try {
      const lessonData = {
        title: data.title,
        description: data.description || '',
        season_id: parseInt(data.season_id),
        audio_id: data.audio_id ? parseInt(data.audio_id) : undefined,
        video_id: data.video_id ? parseInt(data.video_id) : undefined,
        image_id: data.image_id ? parseInt(data.image_id) : undefined,
        document_id: data.document_id ? parseInt(data.document_id) : undefined,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
        published: data.published,
        is_free: data.is_free,
        lesson_type: data.lesson_type
      };

      await apiClient.createLesson(lessonData);
      toast.success('Lesson created successfully!');
      router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`);
    } catch (error) {
      console.error('Error creating lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!season || !course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push('/courses')}
          className="transition-colors hover:text-foreground"
        >
          Courses
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="transition-colors hover:text-foreground"
        >
          {course.title}
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/courses/${courseId}/seasons`)}
          className="transition-colors hover:text-foreground"
        >
          Seasons
        </button>
        <span>/</span>
        <button
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}`)
          }
          className="transition-colors hover:text-foreground"
        >
          {season.title}
        </button>
        <span>/</span>
        <button
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
          }
          className="transition-colors hover:text-foreground"
        >
          Lessons
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">Create</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Lesson</h1>
            <p className="text-muted-foreground">
              Add a new lesson to "{season.title}" in "{course.title}"
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Lesson Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter lesson title" {...field} />
                        </FormControl>
                        <FormDescription>
                          The title of your lesson (5-80 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter lesson description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your lesson (max 400
                          characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Lesson Type */}
                  <FormField
                    control={form.control}
                    name="lesson_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lesson type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="AUDIO">Audio</SelectItem>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="QUIZ">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of content for this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Media IDs */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="video_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter video ID"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            ID of the associated video
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="audio_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audio ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter audio ID"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            ID of the associated audio
                          </FormDescription>
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
                              placeholder="Enter image ID"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            ID of the associated image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="document_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document ID</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter document ID"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            ID of the associated document
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
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
                        <FormDescription>
                          Choose a category for this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Switches */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Published
                            </FormLabel>
                            <FormDescription>
                              Make this lesson visible to students
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
                      name="is_free"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Free Lesson
                            </FormLabel>
                            <FormDescription>
                              Make this lesson free for all students
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

                  {/* Submit Button */}
                  <div className="flex items-center space-x-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Lesson'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${seasonId}/lessons`
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course & Season Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course & Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Course
                </label>
                <p className="text-sm font-semibold">{course.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Season
                </label>
                <p className="text-sm font-semibold">{season.title}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Use clear, descriptive titles for your lessons</p>
              <p>
                • Add media IDs to associate videos, audio, images, or documents
              </p>
              <p>• Choose appropriate lesson types based on your content</p>
              <p>
                • Set lessons as free to make them accessible to all students
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
