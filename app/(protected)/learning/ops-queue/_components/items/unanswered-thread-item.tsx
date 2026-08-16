'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsUnansweredThreadItem } from '@/types/learning-operations';

interface UnansweredThreadItemProps {
  item: OpsUnansweredThreadItem;
  language: string;
  onUseForNote: (profileId: string) => void;
}

export function UnansweredThreadItem({
  item,
  language,
  onUseForNote
}: UnansweredThreadItemProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-medium">{item.context_type}</p>
      <p className="text-muted-foreground">
        {t('opsQueue.profile')}: {item.profile_name || t('users.unnamedUser')}
      </p>
      <p className="text-muted-foreground">
        {new Date(item.last_message_at).toLocaleString(language)}
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
