'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, BookOpen, Calendar, Play, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course } from '@/types/api';
import { useSchool } from '@/contexts/SchoolContext';
import { ErrorHandler } from '@/lib/error-handler';

export default function SeasonViewPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId && seasonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
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
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Season Not Found</h2>
            <p className="mb-4 text-muted-foreground">
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
            Back to Seasons
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{season.title}</h1>
            <p className="text-muted-foreground">
              Season details for "{course.title}"
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
            }
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Lessons
          </Button>
          <Button
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Season
          </Button>
        </div>
      </div>

      {/* Season Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Season Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Title
              </label>
              <p className="text-lg font-semibold">{season.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm">
                {season.description || 'No description provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Order
              </label>
              <p className="text-sm">{season.order}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Badge variant={season.is_active ? 'default' : 'secondary'}>
                {season.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course Information
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
                Course Description
              </label>
              <p className="text-sm">
                {course.description || 'No description provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Course Status
              </label>
              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                {course.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>
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

      {/* Course Management */}
      <Card>
        <CardHeader>
          <CardTitle>Season Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
              }
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Lessons
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/courses/${courseId}/seasons/${seasonId}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Season
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/courses/${courseId}/seasons/${seasonId}/lessons/create`
                )
              }
            >
              <Play className="mr-2 h-4 w-4" />
              Add New Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
