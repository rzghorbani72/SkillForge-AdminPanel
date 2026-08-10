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
  BookOpen,
  FileText,
  Image as ImageIcon,
  Volume2,
  Video
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { sanitizeRichText } from '@/lib/sanitize';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import {
  DetailField,
  MediaChip
} from '@/components/content/lesson-detail-parts';
import { toast } from 'react-toastify';

export default function LessonViewPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const params = useParams();
  const router = useRouter();
  const { selectedAcademy } = useStore();
  const courseId = params.course_id as string;
  const seasonId = params.season_id as string;
  const lessonId = params.lesson_id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lessonsPath = `/courses/${courseId}/seasons/${seasonId}/lessons`;
  const editPath = `${lessonsPath}/${lessonId}/edit`;

  useEffect(() => {
    if (courseId && seasonId && lessonId && selectedAcademy) {
      fetchData();
    }
  }, [courseId, seasonId, lessonId, selectedAcademy]);

  const fetchData = async () => {
    if (!selectedAcademy) return;

    try {
      setIsLoading(true);
      const [lessonResponse, seasonResponse, courseResponse] =
        await Promise.all([
          apiClient.getLesson(lessonId),
          apiClient.getSeason(seasonId),
          apiClient.getCourse(courseId)
        ]);

      if (lessonResponse) setLesson(lessonResponse);
      if (seasonResponse) setSeason(seasonResponse);
      if (courseResponse) setCourse(courseResponse);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success(t('courses.lessonDeleted'));
      router.push(lessonsPath);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">{t('courses.loadingLesson')}</p>
        </div>
      </div>
    );
  }

  if (!lesson || !season || !course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-2xl font-bold">{t('courses.lessonNotFound')}</h2>
          <p className="text-muted-foreground">
            {t('courses.lessonNotFoundDesc')}
          </p>
          <Button variant="outline" onClick={() => router.push(lessonsPath)}>
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('courses.backToLessons')}
          </Button>
        </div>
      </div>
    );
  }

  const posterUrl = (lesson.Image ?? lesson.image)?.publicUrl;
  const videoPoster = posterUrl?.startsWith('/')
    ? `${process.env.NEXT_PUBLIC_HOST}${posterUrl}`
    : posterUrl;

  const media = [
    {
      key: 'video',
      label: t('courses.lessonVideo'),
      attached: Boolean(lesson.video_id),
      icon: <Video className="h-4 w-4 text-muted-foreground" />
    },
    {
      key: 'audio',
      label: t('courses.lessonAudio'),
      attached: Boolean(lesson.audio_id),
      icon: <Volume2 className="h-4 w-4 text-muted-foreground" />
    },
    {
      key: 'document',
      label: t('courses.lessonDocument'),
      attached: Boolean(lesson.document_id),
      icon: <FileText className="h-4 w-4 text-muted-foreground" />
    },
    {
      key: 'poster',
      label: t('courses.lessonPoster'),
      attached: Boolean(lesson.image_id),
      icon: <ImageIcon className="h-4 w-4 text-muted-foreground" />
    }
  ];

  const breadcrumb = [
    { label: t('courses.title'), href: '/courses' },
    { label: course.title, href: `/courses/${courseId}` },
    { label: t('courses.seasons'), href: `/courses/${courseId}/seasons` },
    {
      label: season.title,
      href: `/courses/${courseId}/seasons/${seasonId}`
    },
    { label: t('courses.lessons'), href: lessonsPath }
  ];

  return (
    <div className="container mx-auto space-y-6 py-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <button
              onClick={() => router.push(crumb.href)}
              className="max-w-[16rem] truncate transition-colors hover:text-foreground"
            >
              {crumb.label}
            </button>
            <span aria-hidden>/</span>
          </span>
        ))}
        <span className="font-medium text-foreground">{lesson.title}</span>
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => router.push(lessonsPath)}
          >
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('courses.backToLessons')}
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {lesson.title}
              </h1>
              <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                {lesson.is_published
                  ? t('courses.published')
                  : t('courses.draft')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('courses.lessonDetailsSubtitle', {
                season: season.title,
                course: course.title
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push(editPath)}>
            <Edit className="me-2 h-4 w-4" />
            {t('courses.editLesson')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="me-2 h-4 w-4" />
                {t('courses.deleteLesson')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('courses.deleteLessonDesc', { title: lesson.title })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLesson}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {lesson.video_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              {t('courses.lessonVideoTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video controls className="h-full w-full" poster={videoPoster}>
                <source
                  src={apiClient.getVideoStreamUrl(lesson.video_id)}
                  type="video/mp4"
                />
                {t('courses.videoNotSupported')}
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('courses.lessonInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailField label={t('common.title')} emphasis>
              {lesson.title}
            </DetailField>
            <DetailField label={t('common.description')}>
              {lesson.description || t('common.noDescriptionProvided')}
            </DetailField>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label={t('courses.duration')}>
                {lesson.duration || '—'}
              </DetailField>
              <DetailField label={t('courses.orderLabel')}>
                {lesson.order != null ? formatNumber(lesson.order) : '—'}
              </DetailField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {t('courses.courseSeasonInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailField label={t('courses.courseLabel')} emphasis>
              {course.title}
            </DetailField>
            <DetailField label={t('courses.season')} emphasis>
              {season.title}
            </DetailField>
            <DetailField label={t('courses.seasonDescriptionLabel')}>
              {season.description || t('common.noDescriptionProvided')}
            </DetailField>
            <DetailField label={t('courses.seasonOrder')}>
              {formatNumber(season.order)}
            </DetailField>
          </CardContent>
        </Card>
      </div>

      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('courses.lessonContent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose-description max-w-none text-sm"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(lesson.content)
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {t('courses.mediaInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <MediaChip
              key={item.key}
              label={item.label}
              icon={item.icon}
              attached={item.attached}
              attachedLabel={t('courses.mediaAttached')}
              missingLabel={t('courses.mediaMissing')}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('courses.lessonQuickLinks')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/videos')}>
            <Video className="me-2 h-4 w-4" />
            {t('courses.manageVideos')}
          </Button>
          <Button variant="outline" onClick={() => router.push('/audios')}>
            <Volume2 className="me-2 h-4 w-4" />
            {t('courses.manageAudios')}
          </Button>
          <Button variant="outline" onClick={() => router.push('/documents')}>
            <FileText className="me-2 h-4 w-4" />
            {t('courses.manageDocuments')}
          </Button>
          <Button variant="outline" onClick={() => router.push(editPath)}>
            <Edit className="me-2 h-4 w-4" />
            {t('courses.editLesson')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
