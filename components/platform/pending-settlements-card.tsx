'use client';

import Link from 'next/link';
import { Banknote, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePendingSettlementCount } from '@/hooks/usePendingSettlementCount';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

/** Settlement requests waiting for staff — orange while any are open. */
export function PendingSettlementsCard() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const count = usePendingSettlementCount();
  const open = count > 0;

  return (
    <Link href="/withdrawals" className="block">
      <Card
        className={cn(
          'transition-colors hover:bg-accent',
          open &&
            'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20'
        )}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
              open
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Banknote className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {t('platform.overview.pendingSettlements', {
                count: formatNumber(count)
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                open
                  ? 'platform.overview.pendingSettlementsHint'
                  : 'platform.overview.noPendingSettlements'
              )}
            </p>
          </div>
          <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground ltr:rotate-180 rtl:rotate-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
