'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsMissedClassItem } from '@/types/learning-operations';

interface MissedClassItemProps {
  item: OpsMissedClassItem;
  language: string;
  onUseForNote: (profileId: string) => void;
}

export function MissedClassItem({
  item,
  language,
  onUseForNote
}: MissedClassItemProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-medium">
        {item.Profile?.display_name || t('users.unnamedUser')}
      </p>
      <p className="text-muted-foreground">
        {t('opsQueue.missedSessionAt')}:{' '}
        {item.Session
          ? new Date(item.Session.starts_at).toLocaleString(language)
          : '—'}
      </p>
      <p className="text-muted-foreground">
        {new Date(item.created_at).toLocaleString(language)}
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
