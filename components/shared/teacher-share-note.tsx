'use client';

import { Info } from 'lucide-react';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';

type Props = { className?: string };

/**
 * One line on every money view telling the teacher which share of each sale
 * is theirs. The rate is set by the manager in academy settings.
 */
export function TeacherShareNote({ className }: Props) {
  const { t } = useTranslation();
  const percent = usePercentLabel();
  const academy = useCurrentAcademy();
  const rate = academy?.teacher_share_rate;
  if (rate === undefined || rate === null) return null;

  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className
      )}
    >
      <Info className="h-3.5 w-3.5 shrink-0" />
      {t('teacherShare.note', {
        teacher: percent(rate * 100),
        academy: percent((1 - rate) * 100)
      })}
    </p>
  );
}
