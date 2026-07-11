'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OpsInactivityItem } from '@/types/learning-operations';

interface InactivityItemProps {
  item: OpsInactivityItem;
  language: string;
  onUseForNote: (profileId: string) => void;
}

export function InactivityItem({
  item,
  language,
  onUseForNote
}: InactivityItemProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border p-3 text-sm">
      <p className="font-medium">
        {t('opsQueue.profile')}: {item.profile_id}
      </p>
      <p className="text-muted-foreground">
        {t('opsQueue.courseId')}: {item.course_id}
      </p>
      <p className="text-muted-foreground">
        {t('learningOperations.lastAccessed')}:{' '}
        {item.last_accessed
          ? new Date(item.last_accessed).toLocaleString(language)
          : '—'}
      </p>
      {typeof item.progress_percent === 'number' && (
        <Badge variant="outline">{item.progress_percent}%</Badge>
      )}
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
