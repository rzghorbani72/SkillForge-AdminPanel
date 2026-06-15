'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, BookOpen, Calendar, Play } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Season, Course } from '@/types/api';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SeasonViewPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId && seasonId && selectedAcademy) {
      fetchData();
    }
  }, [courseId, seasonId, selectedAcademy]);

  const fetchData = async () => {
    if (!selectedAcademy) return;

    try {
      setIsLoading(true);
      const [seasonResponse, courseResponse] = await Promise.all([
        apiClient.getSeason(seasonId),
        apiClient.getCourse(courseId)
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
            <p className="text-muted-foreground">
              {t('courses.loadingSeason')}
            </p>
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
            <h2 className="mb-4 text-2xl font-bold">
              {t('courses.seasonNotFound')}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {t('courses.seasonNotFoundDesc')}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/courses/${courseId}/seasons`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('courses.backToSeasons')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // <AccessControlGuard
    //   resource={{
    //     owner_id: course?.author_id,
    //     academy_id: course?.academy_id ?? 0,
    //     access_control: (season as any).access_control
    //   }}
    //   action="view"
    //   fallbackPath={`/courses/${courseId}/seasons`}
    //   fallbackMessage="You do not have permission to view this season."
    // >
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
        <button
          onClick={() => router.push(`/courses/${courseId}/seasons`)}
          className="transition-colors hover:text-foreground"
        >
          {t('courses.seasons')}
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
            {t('courses.backToSeasons')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{season.title}</h1>
            <p className="text-muted-foreground">
              {t('courses.seasonDetailsSubtitle', { title: course.title })}
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
            {t('courses.manageLessons')}
          </Button>
          <Button
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            {t('courses.editSeason')}
          </Button>
        </div>
      </div>

      {/* Season Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {t('courses.seasonInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.title')}
              </label>
              <p className="text-lg font-semibold">{season.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.description')}
              </label>
              <p className="text-sm">
                {season.description || t('common.noDescriptionProvided')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.orderLabel')}
              </label>
              <p className="text-sm">{season.order}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.status')}
              </label>
              <Badge variant={season.is_active ? 'default' : 'secondary'}>
                {season.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              {t('courses.courseInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.courseLabel')}
              </label>
              <p className="text-lg font-semibold">{course.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.courseDescriptionLabel')}
              </label>
              <p className="text-sm">
                {course.description || t('common.noDescriptionProvided')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.courseStatus')}
              </label>
              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                {course.is_published
                  ? t('courses.published')
                  : t('courses.draft')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.seasonManagement')}</CardTitle>
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
              {t('courses.addNewLesson')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    // </AccessControlGuard>
  );
}
