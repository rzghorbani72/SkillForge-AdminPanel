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
  Calendar,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Clock,
  Play,
  Video
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course, Lesson } from '@/types/api';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import CreateSeasonDialog from '@/components/content/create-season-dialog';
import { useTranslation } from '@/lib/i18n/hooks';
import { toast } from 'sonner';

export default function SeasonsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const courseId = params.course_id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [orphanedLessons, setOrphanedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && selectedAcademy) {
      fetchData();
    }
  }, [courseId, selectedAcademy]);

  const fetchData = async () => {
    if (!selectedAcademy) return;

    try {
      setIsLoading(true);
      const [courseResponse, seasonsResponse, lessonsResponse] =
        await Promise.all([
          apiClient.getCourse(courseId),
          apiClient.getSeasons(courseId),
          apiClient.getLessons({ course_id: courseId })
        ]);
      if (courseResponse) {
        setCourse(courseResponse);
      }

      const seasonsData = Array.isArray(seasonsResponse)
        ? seasonsResponse
        : Array.isArray(seasonsResponse as any)
          ? (seasonsResponse as any)
          : [];

      if (seasonsData.length > 0) {
        // Get all lessons for the course
        const lessonsData = Array.isArray(lessonsResponse)
          ? lessonsResponse
          : Array.isArray((lessonsResponse as any)?.lessons)
            ? (lessonsResponse as any).lessons
            : Array.isArray(lessonsResponse as any)
              ? (lessonsResponse as any)
              : [];

        const allLessons = lessonsData as Lesson[];

        // Group lessons by season_id
        const lessonsBySeason = allLessons.reduce(
          (acc: Record<string, Lesson[]>, lesson: Lesson) => {
            const seasonId = lesson.season_id || 'unassigned';
            if (!acc[seasonId]) {
              acc[seasonId] = [];
            }
            acc[seasonId].push(lesson);
            return acc;
          },
          {}
        );

        // Attach lessons to their respective seasons
        const seasonsWithLessons = seasonsData.map((season: any) => ({
          ...season,
          lessons: lessonsBySeason[season.id] || []
        }));

        setSeasons(seasonsWithLessons);

        // Handle lessons without season (orphaned lessons)
        const orphanedLessons = lessonsBySeason[0] || [];
        setOrphanedLessons(orphanedLessons);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    try {
      setIsDeleting(seasonId);
      await apiClient.deleteSeason(seasonId);
      toast.success(t('courses.seasonDeleted'));
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting season:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success(t('courses.lessonDeleted'));
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  // Filter seasons and lessons based on search term
  const filteredSeasons = seasons.filter((season) => {
    const matchesSeason =
      season.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (season.description &&
        season.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLessons = season.lessons?.some(
      (lesson: Lesson) =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.description &&
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return matchesSeason || matchesLessons;
  });

  const filteredOrphanedLessons = orphanedLessons.filter(
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
            <p className="text-muted-foreground">
              {t('courses.loadingSeasons')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">
              {t('courses.courseNotFound')}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {t('courses.courseNotFoundDesc')}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/courses')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('courses.backToCourses')}
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
          {t('courses.title')}
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="transition-colors hover:text-foreground"
        >
          {course.title}
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">
          {t('courses.seasons')}
        </span>
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
            {t('courses.backToCourse')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {t('courses.seasonsManagement')}
            </h1>
            <p className="text-muted-foreground">
              {t('courses.seasonsManagementSubtitle', { title: course.title })}
            </p>
          </div>
        </div>
        <CreateSeasonDialog courseId={courseId} onSeasonCreated={fetchData} />
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder={t('courses.searchSeasonsLessons')}
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
                <div className="text-2xl font-bold">{seasons.length}</div>
                <div className="text-sm text-muted-foreground">
                  {t('courses.totalSeasons')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {seasons.reduce(
                    (acc, season) => acc + (season.lessons?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('courses.totalLessons')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasons Accordion */}
      {filteredSeasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {t('courses.noSeasonsFound')}
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchTerm
                ? t('courses.noSeasonsMatchSearch')
                : t('courses.noSeasonsYet')}
            </p>
            {!searchTerm && (
              <CreateSeasonDialog
                courseId={courseId}
                onSeasonCreated={fetchData}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full">
          {filteredSeasons.map((season) => (
            <AccordionItem
              key={season.id}
              value={`season-${season.id}`}
              //  onClick={() =>
              //       router.push(`/courses/${courseId}/seasons/${season.id}`)
              //     }
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="mr-4 flex w-full items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="text-start text-lg font-semibold">
                        {season.title}
                      </h3>
                      <p className="text-start text-sm text-muted-foreground">
                        {season.description ||
                          t('common.noDescriptionProvided')}
                      </p>
                    </div>
                    <Badge variant="outline">{t('courses.season')}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4" />
                      {t('courses.lessonsCount', {
                        count: season.lessons?.length || 0
                      })}
                    </span>
                    <span className="flex items-center">
                      <Play className="mr-1 h-4 w-4" />
                      {t('courses.orderLabel')}: {season.order}
                    </span>
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation;
                        router.push(
                          `/courses/${courseId}/seasons/${season.id}/edit`
                        );
                      }}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      {t('courses.editSeason')}
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
                      {t('courses.addLesson')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-1 h-4 w-4" />
                          {t('courses.deleteSeason')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('common.areYouSure')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('courses.deleteSeasonDesc', {
                              title: season.title
                            })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {t('common.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSeason(season.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === season.id
                              ? t('common.deleting')
                              : t('common.delete')}
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
                                      lesson.is_published
                                        ? 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {lesson.is_published
                                      ? t('courses.published')
                                      : t('courses.draft')}
                                  </Badge>
                                </div>
                                <p className="mb-2 text-sm text-muted-foreground">
                                  {lesson.description ||
                                    t('common.noDescriptionProvided')}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {lesson.duration || 'N/A'}
                                  </span>
                                  <span className="flex items-center">
                                    <Play className="mr-1 h-3 w-3" />
                                    {t('courses.orderLabel')}:{' '}
                                    {lesson.order || 'N/A'}
                                  </span>
                                  <span className="flex items-center">
                                    <Video className="mr-1 h-3 w-3" />
                                    {lesson.video_id ||
                                    lesson.audio_id ||
                                    lesson.document_id ||
                                    lesson.image_id
                                      ? t('courses.hasMedia')
                                      : t('courses.noMedia')}
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
                                  {t('common.view')}
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
                                  {t('common.edit')}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="mr-1 h-3 w-3" />
                                      {t('common.delete')}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {t('common.areYouSure')}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t('courses.deleteLessonDesc', {
                                          title: lesson.title
                                        })}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {t('common.cancel')}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteLesson(lesson.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {t('common.delete')}
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
                      <p>{t('courses.noLessonsInSeason')}</p>
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
                        {t('courses.addFirstLesson')}
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
      {filteredOrphanedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              {t('courses.lessonsWithoutSeason')}
            </CardTitle>
            <CardDescription>
              {t('courses.lessonsWithoutSeasonDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredOrphanedLessons.map((lesson: Lesson) => (
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
                            variant={
                              lesson.is_published ? 'default' : 'secondary'
                            }
                          >
                            {lesson.is_published
                              ? t('courses.published')
                              : t('courses.draft')}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {lesson.description ||
                            t('common.noDescriptionProvided')}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {lesson.duration || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Play className="mr-1 h-3 w-3" />
                            {t('courses.orderLabel')}: {lesson.order || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Video className="mr-1 h-3 w-3" />
                            {lesson.video_id ||
                            lesson.audio_id ||
                            lesson.document_id ||
                            lesson.image_id
                              ? t('courses.hasMedia')
                              : t('courses.noMedia')}
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
                          {t('common.view')}
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
                          {t('common.edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="mr-1 h-3 w-3" />
                              {t('common.delete')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('common.areYouSure')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('courses.deleteLessonDesc', {
                                  title: lesson.title
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('common.cancel')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('common.delete')}
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
