'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
  Users,
  Clock,
  Calendar,
  DollarSign,
  Star,
  Award,
  Globe,
  BookOpen
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';

export default function CourseViewPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;
  const { selectedSchool } = useSchool();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (courseId && selectedSchool) {
      fetchCourse();
    }
  }, [courseId, selectedSchool]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCourse(parseInt(courseId));
      if (response) setCourse(response);
    } catch (error) {
      console.error('Error fetching course:', error);
      ErrorHandler.handleApiError(error);
      router.push('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = () => {
    router.push(`/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteCourse(course.id);
      ErrorHandler.showSuccess('Course deleted successfully');
      router.push('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(false);
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
              Please select a school from the header to view courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Course Not Found
            </h2>
            <p className="text-muted-foreground">
              The course you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button onClick={() => router.push('/courses')} className="mt-4">
              Back to Courses
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
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {course.title}
            </h1>
            <p className="text-muted-foreground">
              Course details and information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${course.id}/seasons`)}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Seasons
          </Button>
          <Button onClick={handleEditCourse}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{course.title}"? This action
                  cannot be undone and will permanently remove the course and
                  all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Course Cover Image */}
      {/* {course.cover_id && ( */}
      <Card>
        <CardHeader>
          <CardTitle>Course Cover</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 w-full overflow-hidden rounded-lg border">
            <img
              src={`/api/media/${course.cover_id}`}
              alt={course.title}
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
      {/* )} */}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Course Title
            </label>
            <div className="text-lg font-medium">{course.title}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {course.description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Primary Price
              </label>
              <div className="text-lg font-medium">
                ${course.price ? (course.price / 100).toFixed(2) : '0.00'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Secondary Price
              </label>
              <div className="text-lg font-medium">
                $
                {course.original_price
                  ? (course.original_price / 100).toFixed(2)
                  : '0.00'}
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
              <label className="mb-1 block text-sm font-medium">Category</label>
              <div className="text-sm">
                {course.category?.name || 'No Category'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Season ID
              </label>
              <div className="text-sm">
                {course.seasons?.length
                  ? course.seasons.length + ' seasons'
                  : 'Not specified'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Audio ID</label>
              <div className="text-sm">
                {course.audio_id || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Video ID</label>
              <div className="text-sm">
                {course.video_id || 'Not specified'}
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
              <div className="text-base font-medium">Publish Course</div>
              <div className="text-sm text-gray-500">
                Make this course visible to students immediately
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                {course.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Management Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4 text-sm text-muted-foreground">
              Manage your course content hierarchy: Course → Seasons → Lessons →
              Content
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => router.push(`/courses/${course.id}/seasons`)}
              >
                <div className="mb-2 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <span className="font-medium">Manage Seasons</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  Create and organize seasons within this course
                </span>
              </Button>

              <Button
                variant="outline"
                className="flex h-auto flex-col items-start p-4"
                onClick={() => router.push(`/courses/${course.id}/edit`)}
              >
                <div className="mb-2 flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  <span className="font-medium">Edit Course</span>
                </div>
                <span className="text-left text-sm text-muted-foreground">
                  Update course information and settings
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
