'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  BookOpen,
  Play,
  Volume2,
  Video,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';

export default function SeasonLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const seasonId = params.seasonId as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (seasonId && courseId) {
      fetchData();
    }
  }, [seasonId, courseId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [lessonsResponse, seasonResponse, courseResponse] =
        await Promise.all([
          apiClient.getLessons({ season_id: parseInt(seasonId) }),
          apiClient.getSeason(parseInt(seasonId)),
          apiClient.getCourse(parseInt(courseId))
        ]);

      if (lessonsResponse.data && Array.isArray(lessonsResponse.data)) {
        setLessons(lessonsResponse.data);
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

  const handleDelete = async (lessonId: number) => {
    try {
      setIsDeleting(lessonId);
      await apiClient.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading lessons...</p>
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
        <button
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}`)
          }
          className="transition-colors hover:text-foreground"
        >
          {season.title}
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">Lessons</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Season
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
            <p className="text-muted-foreground">
              Manage lessons for "{season.title}" in "{course.title}"
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(
              `/courses/${courseId}/seasons/${seasonId}/lessons/create`
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Lesson
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lessons.length}</div>
          <p className="text-xs text-muted-foreground">
            Lessons in this season
          </p>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No lessons found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchTerm
                ? 'No lessons match your search criteria.'
                : "This season doesn't have any lessons yet."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() =>
                  router.push(
                    `/courses/${courseId}/seasons/${seasonId}/lessons/create`
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">
                  {lesson.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {lesson.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {lesson.duration || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Play className="mr-1 h-4 w-4" />
                      Order: {lesson.order || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Video className="mr-1 h-4 w-4" />
                      {lesson.video_id ? 'Video' : 'No Video'}
                    </span>
                    <span className="flex items-center">
                      <Volume2 className="mr-1 h-4 w-4" />
                      {lesson.audio_id ? 'Audio' : 'No Audio'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={lesson.is_published ? 'default' : 'secondary'}
                    >
                      {lesson.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {lesson.document_ids?.length || 0} docs
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}`
                        )
                      }
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}/edit`
                        )
                      }
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the lesson "{lesson.title}" and all its
                            associated content.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(lesson.id)}
                            disabled={isDeleting === lesson.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === lesson.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
