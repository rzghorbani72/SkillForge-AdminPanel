'use client';

import { Clock, Edit, Eye, Play, Trash2, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useTranslation } from '@/lib/i18n/hooks';
import type { Lesson } from '@/types/api';

type SeasonLessonRowProps = {
  lesson: Lesson;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function hasMedia(lesson: Lesson): boolean {
  return Boolean(
    lesson.video_id ?? lesson.audio_id ?? lesson.document_id ?? lesson.image_id
  );
}

export function SeasonLessonRow({
  lesson,
  onView,
  onEdit,
  onDelete
}: SeasonLessonRowProps) {
  const { t } = useTranslation();

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium">{lesson.title}</h4>
            <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
              {lesson.is_published
                ? t('courses.published')
                : t('courses.draft')}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {lesson.description || t('common.noDescriptionProvided')}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.duration || '—'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Play className="h-3 w-3" />
              {t('courses.orderLabel')}: {lesson.order ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Video className="h-3 w-3" />
              {hasMedia(lesson) ? t('courses.hasMedia') : t('courses.noMedia')}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="me-1 h-3 w-3" />
            {t('common.view')}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="me-1 h-3 w-3" />
            {t('common.edit')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="me-1 h-3 w-3" />
                {t('common.delete')}
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
                  onClick={onDelete}
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
}
