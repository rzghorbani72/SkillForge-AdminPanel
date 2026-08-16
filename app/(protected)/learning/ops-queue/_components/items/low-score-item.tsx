'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsLowScoreItem } from '@/types/learning-operations';

interface LowScoreItemProps {
  item: OpsLowScoreItem;
  onUseForNote: (profileId: string) => void;
}

export function LowScoreItem({ item, onUseForNote }: LowScoreItemProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-medium">
        {item.Assignment?.title ?? t('assignmentsPage.notAvailable')}
      </p>
      <p className="text-muted-foreground">
        {item.Profile?.display_name || t('users.unnamedUser')}
      </p>
      <Badge variant="secondary">
        {item.score ?? '—'} / {item.Assignment?.max_score ?? '—'}
      </Badge>
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
