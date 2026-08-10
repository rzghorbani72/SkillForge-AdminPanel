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
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course, Lesson } from '@/types/api';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import CreateSeasonDialog from '@/components/content/create-season-dialog';
import { SeasonLessonRow } from '@/components/content/season-lesson-row';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { toast } from 'react-toastify';

type SeasonWithLessons = Season & { lessons?: Lesson[] };

function matches(text: string | null | undefined, term: string): boolean {
  return (text ?? '').toLowerCase().includes(term);
}

export default function SeasonsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const params = useParams();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const courseId = params.course_id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [seasons, setSeasons] = useState<SeasonWithLessons[]>([]);
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

      const seasonsData: Season[] = Array.isArray(seasonsResponse)
        ? seasonsResponse
        : [];

      if (seasonsData.length > 0) {
        const lessonsPayload = lessonsResponse as
          | Lesson[]
          | { lessons?: Lesson[] };
        const allLessons: Lesson[] = Array.isArray(lessonsPayload)
          ? lessonsPayload
          : (lessonsPayload?.lessons ?? []);

        const lessonsBySeason = allLessons.reduce(
          (acc: Record<string, Lesson[]>, lesson: Lesson) => {
            const seasonId = lesson.season_id || 'unassigned';
            acc[seasonId] = acc[seasonId] ?? [];
            acc[seasonId].push(lesson);
            return acc;
          },
          {}
        );

        setSeasons(
          seasonsData.map((season) => ({
            ...season,
            lessons: lessonsBySeason[season.id] ?? []
          }))
        );
        setOrphanedLessons(lessonsBySeason['unassigned'] ?? []);
      }
    } catch (error) {
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
      fetchData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success(t('courses.lessonDeleted'));
      fetchData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  const term = searchTerm.trim().toLowerCase();

  const filteredSeasons = seasons.filter(
    (season) =>
      matches(season.title, term) ||
      matches(season.description, term) ||
      season.lessons?.some(
        (lesson) =>
          matches(lesson.title, term) || matches(lesson.description, term)
      )
  );

  const filteredOrphanedLessons = orphanedLessons.filter(
    (lesson) => matches(lesson.title, term) || matches(lesson.description, term)
  );

  const lessonsTotal = seasons.reduce(
    (acc, season) => acc + (season.lessons?.length ?? 0),
    0
  );

  const lessonPath = (seasonId: string, lessonId: string, suffix = '') =>
    `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}${suffix}`;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">{t('courses.loadingSeasons')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">{t('courses.courseNotFound')}</h2>
          <p className="text-muted-foreground">
            {t('courses.courseNotFoundDesc')}
          </p>
          <Button variant="outline" onClick={() => router.push('/courses')}>
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('courses.backToCourses')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push('/courses')}
          className="transition-colors hover:text-foreground"
        >
          {t('courses.title')}
        </button>
        <span aria-hidden>/</span>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="transition-colors hover:text-foreground"
        >
          {course.title}
        </button>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">
          {t('courses.seasons')}
        </span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('courses.backToCourse')}
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('courses.seasonsManagement')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('courses.seasonsManagementSubtitle', { title: course.title })}
            </p>
          </div>
        </div>
        <CreateSeasonDialog courseId={courseId} onSeasonCreated={fetchData} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('courses.searchSeasonsLessons')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold leading-none">
                {formatNumber(seasons.length)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('courses.totalSeasons')}
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold leading-none">
                {formatNumber(lessonsTotal)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t('courses.totalLessons')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredSeasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {t('courses.noSeasonsFound')}
            </h3>
            <p className="text-center text-muted-foreground">
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
        <Accordion type="multiple" className="w-full space-y-3">
          {filteredSeasons.map((season) => (
            <AccordionItem
              key={season.id}
              value={`season-${season.id}`}
              className="rounded-lg border px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full flex-col gap-2 pe-3 text-start sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold">
                        {season.title}
                      </h3>
                      <p className="truncate text-sm font-normal text-muted-foreground">
                        {season.description ||
                          t('common.noDescriptionProvided')}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {t('courses.season')}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm font-normal text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {t('courses.lessonsCount', {
                        count: season.lessons?.length ?? 0
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {t('courses.orderLabel')}: {formatNumber(season.order)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/courses/${courseId}/seasons/${season.id}/edit`
                        )
                      }
                    >
                      <Edit className="me-1 h-4 w-4" />
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
                      <Plus className="me-1 h-4 w-4" />
                      {t('courses.addLesson')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="me-1 h-4 w-4" />
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

                  {season.lessons && season.lessons.length > 0 ? (
                    <div className="grid gap-3">
                      {season.lessons.map((lesson) => (
                        <SeasonLessonRow
                          key={lesson.id}
                          lesson={lesson}
                          onView={() =>
                            router.push(lessonPath(season.id, lesson.id))
                          }
                          onEdit={() =>
                            router.push(
                              lessonPath(season.id, lesson.id, '/edit')
                            )
                          }
                          onDelete={() => handleDeleteLesson(lesson.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                      <p>{t('courses.noLessonsInSeason')}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/courses/${courseId}/seasons/${season.id}/lessons/create`
                          )
                        }
                      >
                        <Plus className="me-1 h-3 w-3" />
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

      {filteredOrphanedLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('courses.lessonsWithoutSeason')}
            </CardTitle>
            <CardDescription>
              {t('courses.lessonsWithoutSeasonDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filteredOrphanedLessons.map((lesson) => (
                <SeasonLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onView={() => router.push(lessonPath('0', lesson.id))}
                  onEdit={() =>
                    router.push(lessonPath('0', lesson.id, '/edit'))
                  }
                  onDelete={() => handleDeleteLesson(lesson.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
