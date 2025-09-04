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
  BookOpen,
  Calendar,
  Play
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';

export default function SeasonViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const seasonId = params.seasonId as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (seasonId && courseId) {
      fetchData();
    }
  }, [seasonId, courseId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!season) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteSeason(season.id);
      toast.success('Season deleted successfully');
      router.push(`/courses/${courseId}/seasons`);
    } catch (error) {
      console.error('Error deleting season:', error);
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
            <p className="text-muted-foreground">Loading season...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!season || !course) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Season Not Found
            </h2>
            <p className="text-muted-foreground">
              The season you're looking for doesn't exist.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/courses/${courseId}/seasons`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Seasons
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
        <span className="font-medium text-foreground">{season.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${courseId}/seasons`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {season.title}
            </h1>
            <p className="text-muted-foreground">
              {course.title} • Season {season.order || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${season.id}/lessons`)
            }
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Lessons
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${season.id}/edit`)
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
                  season "{season.title}" and all its lessons.
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

      {/* Season Cover Image */}
      {season.cover_id && (
        <Card>
          <CardHeader>
            <CardTitle>Season Cover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full overflow-hidden rounded-lg border">
              <img
                src={`/api/media/${season.cover_id}`}
                alt={season.title}
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
              Season Title
            </label>
            <div className="text-lg font-medium">{season.title}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {season.description || 'No description provided'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Details */}
      <Card>
        <CardHeader>
          <CardTitle>Season Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Order</label>
              <div className="flex items-center text-sm">
                <Play className="mr-1 h-4 w-4" />
                {season.order || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Lessons Count
              </label>
              <div className="flex items-center text-sm">
                <BookOpen className="mr-1 h-4 w-4" />
                {season.lessons_count || 0} lessons
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <div className="text-sm">
                <Badge variant={season.is_published ? 'default' : 'secondary'}>
                  {season.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Created</label>
              <div className="flex items-center text-sm">
                <Calendar className="mr-1 h-4 w-4" />
                {season.created_at
                  ? new Date(season.created_at).toLocaleDateString()
                  : 'N/A'}
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
              <label className="mb-1 block text-sm font-medium">
                Season ID
              </label>
              <div className="text-sm">{season.id}</div>
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
              <div className="text-base font-medium">Publish Season</div>
              <div className="text-sm text-gray-500">
                Make this season visible to students immediately
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant={season.is_published ? 'default' : 'secondary'}>
                {season.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Management Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Season Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4 text-sm text-muted-foreground">
              Manage your season content: Season → Lessons → Content (Video,
              Audio, Documents)
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() =>
                  router.push(
                    `/courses/${courseId}/seasons/${seasonId}/lessons`
                  )
                }
              >
                <div className="mb-2 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <span className="font-medium">Manage Lessons</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  Create and organize lessons within this season
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() =>
                  router.push(`/courses/${courseId}/seasons/${seasonId}/edit`)
                }
              >
                <div className="mb-2 flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  <span className="font-medium">Edit Season</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  Update season information and settings
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
