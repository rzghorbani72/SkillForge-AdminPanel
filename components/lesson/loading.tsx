'use client';

import { useTranslation } from '@/lib/i18n/hooks';

const Loading = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6">
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-muted-foreground">{t('courses.loadingLessons')}</p>
      </div>
    </div>
  );
};

export default Loading;
