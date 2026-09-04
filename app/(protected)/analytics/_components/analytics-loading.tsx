'use client';

import { useTranslation } from '@/lib/i18n/hooks';

export function AnalyticsLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t('common.loading')}
          </p>
        </div>
      </div>
    </div>
  );
}
