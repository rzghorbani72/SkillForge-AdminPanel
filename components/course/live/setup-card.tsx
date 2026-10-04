'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

interface SetupCardProps {
  /** Omitted for an optional card that is not a numbered step. */
  step?: number;
  title: string;
  description: string;
  done: boolean;
  /** Warns before the teacher navigates away from edits they never saved. */
  dirty?: boolean;
  children: ReactNode;
}

/**
 * One numbered step of the live-course setup. The number is the same one the
 * checklist at the top of the page shows, so "step 2" means one place, not two.
 */
export function SetupCard({
  step,
  title,
  description,
  done,
  dirty = false,
  children,
}: SetupCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();

  return (
    <Card className={cn('flex flex-col', dirty && 'border-amber-500/40')}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <span
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
            done
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600'
              : 'border-dashed text-muted-foreground',
          )}
        >
          {done ? <Check className="h-3.5 w-3.5" /> : step != null ? formatNumber(step) : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-none">{title}</h3>
            {dirty ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                {t('common.unsavedChanges')}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
