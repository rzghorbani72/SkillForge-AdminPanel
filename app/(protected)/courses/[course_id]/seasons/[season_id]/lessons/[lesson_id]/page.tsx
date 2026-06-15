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
  Volume2,
  Video
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Course } from '@/types/api';
import { sanitizeRichText } from '@/lib/sanitize';
import { useStore } from '@/hooks/useStore';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { toast } from 'sonner';

export default function LessonViewPage() {
  const { t } = useTranslation();
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

      if (lessonResponse) {
        setLesson(lessonResponse);
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

  const handleDeleteLesson = async () => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success(t('courses.lessonDeleted'));
      router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">
              {t('courses.loadingLesson')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !season || !course) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">
              {t('courses.lessonNotFound')}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {t('courses.lessonNotFoundDesc')}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('courses.backToLessons')}
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
        <button
          onClick={() => router.push(`/courses/${courseId}/seasons`)}
          className="transition-colors hover:text-foreground"
        >
          {t('courses.seasons')}
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
        <button
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
          }
          className="transition-colors hover:text-foreground"
        >
          {t('courses.lessons')}
        </button>
        <span>/</span>
        <span className="font-medium text-foreground">{lesson.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/courses/${courseId}/seasons/${seasonId}/lessons`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">
              {t('courses.lessonDetailsSubtitle', {
                season: season.title,
                course: course.title
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}/edit`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            {t('courses.editLesson')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Lesson Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              {t('courses.lessonInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.title')}
              </label>
              <p className="text-lg font-semibold">{lesson.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.description')}
              </label>
              <p className="text-sm">
                {lesson.description || t('common.noDescriptionProvided')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.duration')}
              </label>
              <p className="text-sm">{lesson.duration || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.orderLabel')}
              </label>
              <p className="text-sm">{lesson.order || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('common.status')}
              </label>
              <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                {lesson.is_published
                  ? t('courses.published')
                  : t('courses.draft')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5" />
              {t('courses.courseSeasonInformation')}
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
                {t('courses.season')}
              </label>
              <p className="text-lg font-semibold">{season.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.seasonDescriptionLabel')}
              </label>
              <p className="text-sm">
                {season.description || t('common.noDescriptionProvided')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.seasonOrder')}
              </label>
              <p className="text-sm">{season.order}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Content */}
      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {t('courses.lessonContent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(lesson.content || '')
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player */}
      {lesson.video_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              {t('courses.lessonVideoTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video
                controls
                className="h-full w-full"
                poster={
                  lesson.image?.publicUrl
                    ? `${lesson.image.publicUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST}${lesson.image.publicUrl}` : lesson.image.publicUrl}`
                    : undefined
                }
              >
                <source
                  src={apiClient.getVideoStreamUrl(lesson.video_id!)}
                  type="video/mp4"
                />
                {t('courses.videoNotSupported')}
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            {t('courses.mediaInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.videoId')}
              </label>
              <p className="text-sm">
                {lesson.video_id || t('courses.noVideoAssigned')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.audioId')}
              </label>
              <p className="text-sm">
                {lesson.audio_id || t('courses.noAudioAssigned')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.documentId')}
              </label>
              <p className="text-sm">
                {lesson.document_id || t('courses.noDocumentAssigned')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('courses.videoPosterImageId')}
              </label>
              <p className="text-sm">
                {lesson.image_id || t('courses.noImageAssigned')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.contentManagement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push(`/videos`)}>
              <Video className="mr-2 h-4 w-4" />
              {t('courses.manageVideos')}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/audios`)}>
              <Volume2 className="mr-2 h-4 w-4" />
              {t('courses.manageAudios')}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/documents`)}>
              <FileText className="mr-2 h-4 w-4" />
              {t('courses.manageDocuments')}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/courses/${courseId}/seasons/${seasonId}/lessons/${lessonId}/edit`
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('courses.editLesson')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
