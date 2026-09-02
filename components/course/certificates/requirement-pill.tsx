'use client';

import { Check } from 'lucide-react';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';
import type { CertificateRequirementTally } from '@/types/learning-operations';

interface RequirementPillProps {
  label: string;
  tally: CertificateRequirementTally;
}

/**
 * "۴ از ۶ درس" at a glance. A requirement the course does not have shows a dash
 * rather than a green tick, so an empty course never looks finished.
 */
export function RequirementPill({ label, tally }: RequirementPillProps) {
  const formatNumber = useNumberFormat();
  const complete = tally.total > 0 && tally.done >= tally.total;

  if (tally.total === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
        complete
          ? 'bg-emerald-500/15 text-emerald-600'
          : 'bg-muted text-muted-foreground'
      )}
      title={label}
    >
      {complete ? <Check className="h-3 w-3" /> : null}
      {formatNumber(tally.done)}/{formatNumber(tally.total)}
    </span>
  );
}
