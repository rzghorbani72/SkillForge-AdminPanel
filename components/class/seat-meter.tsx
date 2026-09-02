'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

interface SeatMeterProps {
  taken: number;
  capacity: number;
  className?: string;
}

/**
 * How full a class is, as a bar rather than a fraction: a manager scanning ten
 * classes needs to spot the empty one without reading two numbers per row. The
 * bar turns amber when a class is nearly sold out, which is when a second class
 * is worth opening.
 */
export function SeatMeter({ taken, capacity, className }: SeatMeterProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const percent =
    capacity > 0 ? Math.min(100, Math.round((taken / capacity) * 100)) : 0;
  const full = capacity > 0 && taken >= capacity;
  const nearlyFull = !full && percent >= 80;

  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <p className="text-xs text-muted-foreground">
        {t('courses.live.seatsTaken', {
          taken: formatNumber(taken),
          capacity: formatNumber(capacity)
        })}
      </p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            full ? 'bg-emerald-500' : nearlyFull ? 'bg-amber-500' : 'bg-primary'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
