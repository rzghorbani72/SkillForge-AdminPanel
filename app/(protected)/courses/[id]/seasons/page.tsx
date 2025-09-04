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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
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
  BookOpen,
  Calendar,
  Play,
  Clock,
  Volume2,
  Video,
  FileText
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course, Lesson } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'sonner';
import { useSchool } from '@/contexts/SchoolContext';
import CreateSeasonDialog from '@/components/content/create-season-dialog';

export default function CourseSeasonsPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [orphanedLessons, setOrphanedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (courseId && selectedSchool) {
      fetchData();
    }
  }, [courseId, selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [courseResponse, seasonsResponse, lessonsResponse] =
        await Promise.all([
          apiClient.getCourse(parseInt(courseId)),
          apiClient.getSeasons(parseInt(courseId)),
          apiClient.getLessons({ course_id: parseInt(courseId) })
        ]);
      console.log('seasonsResponse', seasonsResponse);
      console.log('lessonsResponse', lessonsResponse);

      if (courseResponse) {
        setCourse(courseResponse);
      }

      if (seasonsResponse && Array.isArray(seasonsResponse)) {
        // Get all lessons for the course
        const allLessons =
          lessonsResponse.data && Array.isArray(lessonsResponse.data)
            ? lessonsResponse.data
            : [];

        // Group lessons by season_id
        const lessonsBySeason = allLessons.reduce(
          (acc: Record<number, Lesson[]>, lesson: Lesson) => {
            const seasonId = lesson.season_id || 0; // Use 0 for lessons without season
            if (!acc[seasonId]) {
              acc[seasonId] = [];
            }
            acc[seasonId].push(lesson);
            return acc;
          },
          {}
        );

        // Attach lessons to their respective seasons
        const seasonsWithLessons = seasonsResponse.map((season) => ({
          ...season,
          lessons: lessonsBySeason[season.id] || []
        }));

        setSeasons(seasonsWithLessons);

        // Handle lessons without season (orphaned lessons)
        const orphanedLessons = lessonsBySeason[0] || [];
        setOrphanedLessons(orphanedLessons);
        if (orphanedLessons.length > 0) {
          console.log('Found orphaned lessons:', orphanedLessons);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSeason = async (seasonId: number) => {
    try {
      setIsDeleting(seasonId);
      await apiClient.deleteSeason(seasonId);
      toast.success('Season deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting season:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading seasons...</p>
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
              The course you're looking for doesn't exist.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/courses')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
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
        <span className="font-medium text-foreground">Seasons</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
            <p className="text-muted-foreground">
              Manage seasons for "{course.title}"
            </p>
          </div>
        </div>
        <CreateSeasonDialog
          onSeasonCreated={fetchData}
          courseId={parseInt(courseId)}
        />
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search seasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{seasons.length}</div>
          <p className="text-xs text-muted-foreground">
            Seasons in this course
          </p>
        </CardContent>
      </Card>

      {/* Seasons Accordion */}
      {seasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No seasons found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchTerm
                ? 'No seasons match your search criteria.'
                : "This course doesn't have any seasons yet."}
            </p>
            {!searchTerm && (
              <CreateSeasonDialog
                onSeasonCreated={fetchData}
                courseId={parseInt(courseId)}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full">
          {seasons.map((season) => (
            <AccordionItem key={season.id} value={`season-${season.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="mr-4 flex w-full items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="text-left text-lg font-semibold">
                        {season.title}
                      </h3>
                      <p className="text-left text-sm text-muted-foreground">
                        {season.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
                      {season.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center">
                      <Play className="mr-1 h-4 w-4" />
                      Order: {season.order || 'N/A'}
                    </span>
                    <Badge variant="outline">Season</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Season Actions */}
                  <div className="flex items-center space-x-2 border-b pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/courses/${courseId}/seasons/${season.id}`)
                      }
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View Season
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${season.id}/edit`
                        )
                      }
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit Season
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${season.id}/lessons/create`
                        )
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Lesson
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete Season
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the season "{season.title}" and all its
                            lessons.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSeason(season.id)}
                            disabled={isDeleting === season.id}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === season.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Lessons List */}
                  {season.lessons && season.lessons.length > 0 ? (
                    <div className="grid gap-3">
                      {season.lessons.map((lesson: Lesson) => (
                        <Card
                          key={lesson.id}
                          className="transition-shadow hover:shadow-md"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-3">
                                  <h4 className="font-medium">
                                    {lesson.title}
                                  </h4>
                                  <Badge
                                    variant={
                                      lesson.is_active ? 'default' : 'secondary'
                                    }
                                  >
                                    {lesson.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <p className="mb-2 text-sm text-muted-foreground">
                                  {lesson.description ||
                                    'No description provided'}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {lesson.duration || 'N/A'}
                                  </span>
                                  <span className="flex items-center">
                                    <Play className="mr-1 h-3 w-3" />
                                    Order: {lesson.order || 'N/A'}
                                  </span>
                                  <span className="flex items-center">
                                    <Video className="mr-1 h-3 w-3" />
                                    {lesson.media_id ? 'Media' : 'No Media'}
                                  </span>
                                  <span className="flex items-center">
                                    <Volume2 className="mr-1 h-3 w-3" />
                                    {lesson.media?.type || 'No Type'}
                                  </span>
                                  <span className="flex items-center">
                                    <FileText className="mr-1 h-3 w-3" />
                                    {lesson.content ? 'Content' : 'No Content'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/courses/${courseId}/seasons/${season.id}/lessons/${lesson.id}`
                                    )
                                  }
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/courses/${courseId}/seasons/${season.id}/lessons/${lesson.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-1 h-3 w-3" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the lesson "
                                        {lesson.title}" and all its associated
                                        content.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
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
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <BookOpen className="mx-auto mb-2 h-8 w-8" />
                      <p>No lessons in this season yet.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          router.push(
                            `/courses/${courseId}/seasons/${season.id}/lessons/create`
                          )
                        }
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add First Lesson
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Orphaned Lessons Section */}
      {orphanedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Lessons Without Season
            </CardTitle>
            <CardDescription>
              These lessons are not assigned to any season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {orphanedLessons.map((lesson: Lesson) => (
                <Card
                  key={lesson.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <Badge
                            variant={lesson.is_active ? 'default' : 'secondary'}
                          >
                            {lesson.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {lesson.description || 'No description provided'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {lesson.duration || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Play className="mr-1 h-3 w-3" />
                            Order: {lesson.order || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Video className="mr-1 h-3 w-3" />
                            {lesson.media_id ? 'Media' : 'No Media'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/seasons/0/lessons/${lesson.id}`
                            )
                          }
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/seasons/0/lessons/${lesson.id}/edit`
                            )
                          }
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="mr-1 h-3 w-3" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the lesson "{lesson.title}"
                                and all its associated content.
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
