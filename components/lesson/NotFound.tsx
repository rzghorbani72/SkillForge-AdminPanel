'use client';

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

const NotFound = ({
  searchTerm,
  router,
  courseId,
  seasonId
}: {
  searchTerm: string;
  router: { push: (href: string) => void };
  courseId: string;
  seasonId: string;
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{t('courses.noLessonsFound')}</h3>
        <p className="text-center text-muted-foreground">
          {searchTerm
            ? t('courses.noLessonsMatchSearch')
            : t('courses.noLessonsInSeason')}
        </p>
        {!searchTerm && (
          <Button
            onClick={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/create`
              )
            }
          >
            <Plus className="me-2 h-4 w-4" />
            {t('courses.addFirstLesson')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotFound;
