'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus,
  Search,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Clock,
  Play,
  Video,
  Volume2,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { useSchool } from '@/contexts/SchoolContext';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';

export default function SeasonLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (courseId && seasonId && selectedSchool) {
      fetchData();
    }
  }, [courseId, seasonId, selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [lessonsResponse, seasonResponse, courseResponse] =
        await Promise.all([
          apiClient.getLessons({ season_id: parseInt(seasonId) }),
          apiClient.getSeason(parseInt(seasonId)),
          apiClient.getCourse(parseInt(courseId))
        ]);

      if (lessonsResponse && Array.isArray(lessonsResponse)) {
        setLessons(lessonsResponse);
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

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  // Filter lessons based on search term
  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lesson.description &&
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
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
            <h1 className="text-3xl font-bold">Lessons Management</h1>
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
          Add New Lesson
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{lessons.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Lessons
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {lessons.filter((lesson) => lesson.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Lessons
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                Add First Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{lesson.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {lesson.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant={lesson.is_active ? 'default' : 'secondary'}>
                    {lesson.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {lesson.duration || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Play className="mr-1 h-4 w-4" />
                      Order: {lesson.order || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Video className="mr-1 h-4 w-4" />
                      {lesson.media_id ? 'Media' : 'No Media'}
                    </span>
                    <span className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      {lesson.content ? 'Content' : 'No Content'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
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
                      <Eye className="mr-1 h-3 w-3" />
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
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
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
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
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
