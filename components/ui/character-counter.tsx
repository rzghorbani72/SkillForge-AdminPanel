'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

type CharacterCounterProps = {
  length: number;
  maxLength: number;
  className?: string;
};

export function CharacterCounter({ length, maxLength, className }: CharacterCounterProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  const remaining = Math.max(maxLength - length, 0);
  const isNearLimit = length >= maxLength * 0.9;

  return (
    <p
      className={cn(
        'shrink-0 text-sm',
        isNearLimit ? 'text-orange-600' : 'text-muted-foreground',
        className,
      )}
    >
      {formatNumber(length)}/{formatNumber(maxLength)} —{' '}
      {t('editor.charactersRemaining', { count: formatNumber(remaining) })}
    </p>
  );
}
