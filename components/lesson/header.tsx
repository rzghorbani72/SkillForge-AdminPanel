'use client';

import { Button } from '../ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Course, Season } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

const LessonHeader = ({
  courseId,
  seasonId,
  season,
  course,
  router
}: {
  courseId: string;
  seasonId: string;
  season: Season;
  course: Course;
  router: { push: (href: string) => void };
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight">
          {t('courses.lessonsManagement')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('courses.lessonsManagementSubtitle', {
            season: season.title,
            course: course.title
          })}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}`)
          }
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('courses.backToSeason')}
        </Button>
        <Button
          onClick={() =>
            router.push(
              `/courses/${courseId}/seasons/${seasonId}/lessons/create`
            )
          }
        >
          <Plus className="me-2 h-4 w-4" />
          {t('courses.addNewLesson')}
        </Button>
      </div>
    </div>
  );
};

export default LessonHeader;
