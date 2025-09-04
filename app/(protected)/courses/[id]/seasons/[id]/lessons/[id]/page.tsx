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
  Clock,
  BookOpen,
  FileText,
  Volume2,
  Video
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const seasonId = params.seasonId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (lessonId && seasonId && courseId) {
      fetchData();
    }
  }, [lessonId, seasonId, courseId]);

  const fetchData = async () => {
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

  const handleDelete = async () => {
    if (!lesson) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteLesson(lesson.id);
      toast.success('Lesson deleted successfully');
      router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
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

  if (!lesson || !season || !course) {
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
    <div className="flex-1 space-y-6 p-6">
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              {course.title} • {season.title} • Lesson {lesson.order || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}/edit`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Lesson Cover Image */}
      {lesson.cover_id && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Cover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full overflow-hidden rounded-lg border">
              <img
                src={`/api/media/${lesson.cover_id}`}
                alt={lesson.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <div className="mb-2 text-4xl">📷</div>
                  <div className="text-sm">Image not available</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="text-lg font-medium">{lesson.title}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {lesson.description || 'No description provided'}
            </div>
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
              <label className="mb-1 block text-sm font-medium">Duration</label>
              <div className="flex items-center text-sm">
                <Clock className="mr-1 h-4 w-4" />
                {lesson.duration || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Order</label>
              <div className="flex items-center text-sm">
                <Play className="mr-1 h-4 w-4" />
                {lesson.order || 'Not specified'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <div className="text-sm">
                <Badge variant="outline">{lesson.type || 'Standard'}</Badge>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <div className="text-sm">
                <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                  {lesson.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>
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
              <div className="flex items-center text-sm">
                <BookOpen className="mr-1 h-4 w-4" />
                {course.title}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Season</label>
              <div className="text-sm">{season.title}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Audio</label>
              <div className="flex items-center text-sm">
                <Volume2 className="mr-1 h-4 w-4" />
                {lesson.audio_id || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Video</label>
              <div className="flex items-center text-sm">
                <Video className="mr-1 h-4 w-4" />
                {lesson.video_id || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Documents
              </label>
              <div className="flex items-center text-sm">
                <FileText className="mr-1 h-4 w-4" />
                {lesson.document_ids?.length || 0} document(s)
              </div>
            </div>
          </div>
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
            <div className="flex items-center">
              <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                {lesson.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4 text-sm text-muted-foreground">
              Manage lesson content: Video, Audio, Documents, and Images
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => {
                  // Navigate to video management or show video upload
                  toast.info('Video management coming soon');
                }}
              >
                <div className="mb-2 flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  <span className="font-medium">Video</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  {lesson.video_id
                    ? 'Manage video content'
                    : 'Upload video content'}
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => {
                  // Navigate to audio management or show audio upload
                  toast.info('Audio management coming soon');
                }}
              >
                <div className="mb-2 flex items-center">
                  <Volume2 className="mr-2 h-5 w-5" />
                  <span className="font-medium">Audio</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  {lesson.audio_id
                    ? 'Manage audio content'
                    : 'Upload audio content'}
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => {
                  // Navigate to documents management
                  toast.info('Documents management coming soon');
                }}
              >
                <div className="mb-2 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  <span className="font-medium">Documents</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  {lesson.document_ids?.length || 0} document(s) attached
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => {
                  // Navigate to lesson edit for image management
                  router.push(
                    `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}/edit`
                  );
                }}
              >
                <div className="mb-2 flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  <span className="font-medium">Edit Lesson</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  Update lesson details and cover image
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
