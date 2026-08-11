'use client';

import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface UsersPendingBannerProps {
  count: number;
  onReview: () => void;
}

export function UsersPendingBanner({
  count,
  onReview
}: UsersPendingBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center gap-3.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
        <AlertTriangle className="h-[18px] w-[18px]" />
      </span>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold">
          {t('users.pendingBannerTitle', { count })}
        </div>
        <div className="text-[12px] text-muted-foreground">
          {t('users.pendingBannerDesc')}
        </div>
      </div>
      <button
        type="button"
        onClick={onReview}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-muted/50"
      >
        {t('users.reviewRequests')}
        <ChevronDown className="h-3 w-3 -rotate-90" />
      </button>
    </div>
  );
}
