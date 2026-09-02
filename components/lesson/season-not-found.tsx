'use client';

import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

const SeasonNotFound = ({
  router,
  courseId
}: {
  router: { push: (href: string) => void };
  courseId: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6">
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">{t('courses.seasonNotFound')}</h2>
        <p className="text-muted-foreground">
          {t('courses.seasonNotFoundDesc')}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(`/courses/${courseId}/seasons`)}
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('courses.backToSeasons')}
        </Button>
      </div>
    </div>
  );
};

export default SeasonNotFound;
