'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsOverdueGradingItem } from '@/types/learning-operations';

interface OverdueGradingItemProps {
  item: OpsOverdueGradingItem;
  language: string;
  onUseForNote: (profileId: string) => void;
}

export function OverdueGradingItem({ item, language, onUseForNote }: OverdueGradingItemProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-medium">{item.Assignment?.title ?? t('assignmentsPage.notAvailable')}</p>
      <p className="text-muted-foreground">
        {item.Profile?.display_name || t('users.unnamedUser')}
      </p>
      <p className="text-muted-foreground">
        {item.submitted_at ? new Date(item.submitted_at).toLocaleString(language) : '—'}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 h-auto px-0"
        onClick={() => onUseForNote(item.profile_id)}
      >
        {t('opsQueue.useForNote')}
      </Button>
    </div>
  );
}
