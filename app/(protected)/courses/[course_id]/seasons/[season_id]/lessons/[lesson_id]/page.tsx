'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  BookOpen,
  FileText,
  Volume2,
  Video
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { sanitizeRichText } from '@/lib/sanitize';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import AccessControlGuard from '@/components/access-control/AccessControlGuard';

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedStore } = useStore();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const lessonId = params.lesson_id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId && seasonId && lessonId && selectedStore) {
      fetchData();
    }
  }, [courseId, seasonId, lessonId, selectedStore]);

  const fetchData = async () => {
    if (!selectedStore) return;

    try {
      setIsLoading(true);
      const [lessonResponse, seasonResponse, courseResponse] =
        await Promise.all([
          apiClient.getLesson(parseInt(lessonId)),
          apiClient.getSeason(parseInt(seasonId)),
          apiClient.getCourse(parseInt(courseId))
        ]);

      if (lessonResponse) {
        setLesson(lessonResponse);
      }

      if (seasonResponse) {
        setSeason(seasonResponse);
      }

      if (courseResponse) {
        setCourse(courseResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      await apiClient.deleteLesson(parseInt(lessonId));
      toast.success('Lesson deleted successfully');
      router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !season || !course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Lesson Not Found</h2>
            <p className="mb-4 text-muted-foreground">
              The lesson you're looking for doesn't exist.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
              }
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
        <span className="font-medium text-foreground">{lesson.title}</span>
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
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">
              Lesson details for "{season.title}" in "{course.title}"
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}/edit`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Lesson
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Lesson
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  lesson "{lesson.title}" and all its associated content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLesson}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Lesson Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Title
              </label>
              <p className="text-lg font-semibold">{lesson.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm">
                {lesson.description || 'No description provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Duration
              </label>
              <p className="text-sm">{lesson.duration || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Order
              </label>
              <p className="text-sm">{lesson.order || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                {lesson.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5" />
              Course & Season Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Course
              </label>
              <p className="text-lg font-semibold">{course.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Season
              </label>
              <p className="text-lg font-semibold">{season.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Season Description
              </label>
              <p className="text-sm">
                {season.description || 'No description provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Season Order
              </label>
              <p className="text-sm">{season.order}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Content */}
      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Lesson Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(lesson.content || '')
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player */}
      {lesson.video_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Lesson Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video
                controls
                className="h-full w-full"
                poster={
                  lesson.image?.url
                    ? `${lesson.image.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST}${lesson.image.url}` : lesson.image.url}`
                    : undefined
                }
              >
                <source
                  src={apiClient.getVideoStreamUrl(
                    parseInt(lesson.video_id.toString())
                  )}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            Media Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Video ID
              </label>
              <p className="text-sm">
                {lesson.video_id || 'No video assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Audio ID
              </label>
              <p className="text-sm">
                {lesson.audio_id || 'No audio assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Document ID
              </label>
              <p className="text-sm">
                {lesson.document_id || 'No document assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Video Poster Image ID
              </label>
              <p className="text-sm">
                {lesson.image_id || 'No image assigned'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push(`/videos`)}>
              <Video className="mr-2 h-4 w-4" />
              Manage Videos
            </Button>
            <Button variant="outline" onClick={() => router.push(`/audios`)}>
              <Volume2 className="mr-2 h-4 w-4" />
              Manage Audios
            </Button>
            <Button variant="outline" onClick={() => router.push(`/documents`)}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Documents
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}/edit`
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
