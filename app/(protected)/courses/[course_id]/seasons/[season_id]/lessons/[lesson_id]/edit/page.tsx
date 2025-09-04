'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';
import { toast } from 'sonner';
import LessonForm from '@/components/lesson/LessonForm';
import { LessonFormData } from '@/components/lesson/schema';

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const lessonId = params.lesson_id as string;
  const { selectedSchool } = useSchool();
  const { categories } = useCategoriesStore();

  const [isLoading, setIsLoading] = useState(false);
  const [season, setSeason] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<LessonFormData | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSchool) return;

      try {
        setIsLoading(true);
        const [lessonResponse, seasonResponse, courseResponse] =
          await Promise.all([
            apiClient.getLesson(parseInt(lessonId)),
            apiClient.getSeason(parseInt(seasonId)),
            apiClient.getCourse(parseInt(courseId))
          ]);

        if (lessonResponse) {
          setInitialValues({
            title: lessonResponse.title,
            description: lessonResponse.description ?? '',
            season_id: seasonId,
            audio_id: lessonResponse.audio_id
              ? String(lessonResponse.audio_id)
              : '',
            video_id: lessonResponse.video_id
              ? String(lessonResponse.video_id)
              : '',
            image_id: lessonResponse.image_id
              ? String(lessonResponse.image_id)
              : '',
            document_id: lessonResponse.document_id
              ? String(lessonResponse.document_id)
              : '',
            category_id: lessonResponse.category_id
              ? String(lessonResponse.category_id)
              : '',
            published: Boolean(
              lessonResponse.published ?? lessonResponse.is_active
            ),
            is_free: Boolean(lessonResponse.is_free),
            lesson_type: (lessonResponse.lesson_type as any) ?? 'VIDEO'
          });
        }

        if (seasonResponse) setSeason(seasonResponse);
        if (courseResponse) setCourse(courseResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && seasonId && lessonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, lessonId, selectedSchool]);

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

      await apiClient.updateLesson(parseInt(lessonId), lessonData);
      toast.success('Lesson updated successfully!');
      router.push(
        `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}`
      );
    } catch (error) {
      console.error('Error updating lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialValues || !season || !course) {
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
        <span className="font-medium text-foreground">Edit</span>
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
            <h1 className="text-3xl font-bold">Edit Lesson</h1>
            <p className="text-muted-foreground">
              Update lesson in "{season.title}" for "{course.title}"
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LessonForm
            initialValues={initialValues}
            categories={categories}
            isSubmitting={isLoading}
            onSubmit={onSubmit}
            onCancel={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}`
              )
            }
            submitLabel="Update Lesson"
          />
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
        </div>
      </div>
    </div>
  );
}
