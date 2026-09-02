'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../ui/card';
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
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Edit, Eye, FileText, Play, Trash2 } from 'lucide-react';
import { Lesson } from '@/types/api';
import { AccessControlBadge } from '../ui/access-control-badge';
import LessonMediaPreview from './LessonMediaPreview';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

const LessonCard = ({
  lesson,
  router,
  courseId,
  seasonId,
  handleDeleteLesson
}: {
  lesson: Lesson;
  router: { push: (href: string) => void };
  courseId: string;
  seasonId: string;
  handleDeleteLesson: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const lessonBasePath = `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}`;
  const durationMinutes = lesson.duration
    ? Math.max(1, Math.round(lesson.duration / 60))
    : null;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{lesson.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {lesson.description || t('common.noDescriptionProvided')}
            </CardDescription>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
              {lesson.is_published
                ? t('courses.published')
                : t('courses.draft')}
            </Badge>
            {lesson.access_control && (
              <AccessControlBadge
                accessControl={lesson.access_control}
                className="text-xs"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {durationMinutes
              ? t('courses.durationMinutes', { n: durationMinutes })
              : '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Play className="h-4 w-4" />
            {t('courses.orderLabel')}:{' '}
            {lesson.order != null ? formatNumber(lesson.order) : '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {lesson.content
              ? t('courses.hasContentLabel')
              : t('courses.noContentLabel')}
          </span>
        </div>

        <LessonMediaPreview lesson={lesson} />

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(lessonBasePath)}
          >
            <Eye className="me-1 h-3 w-3" />
            {t('common.view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`${lessonBasePath}/edit`)}
          >
            <Edit className="me-1 h-3 w-3" />
            {t('common.edit')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label={t('courses.deleteLesson')}
              >
                <Trash2 className="h-3 w-3" />
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
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;
