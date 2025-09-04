'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Save } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Course, Season } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import { useSchool } from '@/contexts/SchoolContext';
import ImageUploadPreview from '@/components/ui/ImageUploadPreview';

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration: z.string().optional(),
  order: z.string().optional(),
  type: z.string().optional(),
  course_id: z.string().optional(),
  season_id: z.string().optional(),
  audio_id: z.string().optional(),
  video_id: z.string().optional(),
  cover_id: z.string().optional(),
  is_published: z.boolean().default(false)
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      description: '',
      duration: '',
      order: '',
      type: 'standard',
      course_id: '',
      season_id: '',
      audio_id: '',
      video_id: '',
      cover_id: '',
      is_published: false
    }
  });

  useEffect(() => {
    if (lessonId && selectedSchool) {
      fetchData();
    }
  }, [lessonId, selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoadingLesson(true);
      const [lessonResponse, coursesResponse, seasonsResponse] =
        await Promise.all([
          apiClient.getLesson(parseInt(lessonId)),
          apiClient.getCourses(),
          apiClient.getSeasons()
        ]);

      if (lessonResponse) {
        const lessonData = lessonResponse;
        setLesson(lessonData);

        // Reset form with lesson data
        form.reset({
          title: lessonData.title || '',
          description: lessonData.description || '',
          duration: lessonData.duration || '',
          order: lessonData.order?.toString() || '',
          type: lessonData.type || 'standard',
          course_id: lessonData.course_id?.toString() || '',
          season_id: lessonData.season_id?.toString() || '',
          audio_id: lessonData.audio_id?.toString() || '',
          video_id: lessonData.video_id?.toString() || '',
          cover_id: lessonData.cover_id?.toString() || '',
          is_published: lessonData.is_published || false
        });
      }

      if (coursesResponse && Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      }

      if (seasonsResponse && Array.isArray(seasonsResponse)) {
        setSeasons(seasonsResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const onSubmit = async (data: LessonFormData) => {
    if (!lesson || !selectedSchool) return;

    try {
      setIsLoading(true);

      const lessonData = {
        ...data,
        school_id: selectedSchool.id,
        course_id: data.course_id ? parseInt(data.course_id) : null,
        season_id: data.season_id ? parseInt(data.season_id) : null,
        audio_id: data.audio_id ? parseInt(data.audio_id) : null,
        video_id: data.video_id ? parseInt(data.video_id) : null,
        cover_id: data.cover_id ? parseInt(data.cover_id) : null,
        order: data.order ? parseInt(data.order) : null
      };

      await apiClient.updateLesson(lesson.id, lessonData);
      toast.success('Lesson updated successfully');
      router.push('/lessons');
    } catch (error) {
      console.error('Error updating lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLesson) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Lesson Not Found
            </h2>
            <p className="text-muted-foreground">
              The lesson you're looking for doesn't exist.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/lessons')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Button>
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
            onClick={() => router.push('/lessons')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Lesson</h1>
            <p className="text-muted-foreground">
              Update lesson information and settings
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Lesson Title
              </label>
              <Input
                {...form.register('title')}
                placeholder="Enter lesson title"
                className={form.formState.errors.title ? 'border-red-500' : ''}
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <Textarea
                {...form.register('description')}
                placeholder="Enter lesson description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lesson Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Duration
                </label>
                <Input
                  {...form.register('duration')}
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Order</label>
                <Input
                  {...form.register('order')}
                  type="number"
                  placeholder="Lesson order"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Associations */}
        <Card>
          <CardHeader>
            <CardTitle>Content Associations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Course</label>
                <Select
                  value={form.watch('course_id')}
                  onValueChange={(value) => form.setValue('course_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Season</label>
                <Select
                  value={form.watch('season_id')}
                  onValueChange={(value) => form.setValue('season_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Audio ID
                </label>
                <Input
                  {...form.register('audio_id')}
                  type="number"
                  placeholder="Audio ID"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Video ID
                </label>
                <Input
                  {...form.register('video_id')}
                  type="number"
                  placeholder="Video ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadPreview
              title={form.watch('title') || 'Lesson Cover'}
              description={form.watch('description') || 'Lesson cover image'}
              onSuccess={(image) => {
                console.log(
                  'LessonEdit - Image selected, setting cover_id to:',
                  image.id
                );
                form.setValue('cover_id', image.id.toString());
                console.log(
                  'LessonEdit - Form cover_id is now:',
                  form.getValues('cover_id')
                );
              }}
              selectedImageId={form.watch('cover_id')}
              existingImageUrl={null}
              existingImageId={(lesson as any)?.cover_id}
              alt="Lesson cover preview"
              placeholderText="No cover image selected"
              placeholderSubtext="Upload an image to preview it here"
              uploadButtonText="Upload Cover Image"
              selectButtonText="Select an image first"
            />
          </CardContent>
        </Card>

        {/* Publish Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publish Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-base font-medium">Publish Lesson</div>
                <div className="text-sm text-gray-500">
                  Make this lesson visible to students immediately
                </div>
              </div>
              <Switch
                checked={form.watch('is_published')}
                onCheckedChange={(checked) =>
                  form.setValue('is_published', checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
