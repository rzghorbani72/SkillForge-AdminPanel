'use client';

import { AlertTriangle, CheckCircle2, Moon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/lib/api-academy-health';

const PRESENTATION: Record<
  HealthStatus,
  { icon: typeof CheckCircle2; title: string; hint: string; className: string }
> = {
  ok: {
    icon: CheckCircle2,
    title: 'monitoring.statusOk',
    hint: 'monitoring.statusOkHint',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  degraded: {
    icon: AlertTriangle,
    title: 'monitoring.statusDegraded',
    hint: 'monitoring.statusDegradedHint',
    className: 'border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400',
  },
  // Not an alarm: a silent day at a small academy is normal, and a red banner
  // here would train the manager to ignore the page.
  quiet: {
    icon: Moon,
    title: 'monitoring.statusQuiet',
    hint: 'monitoring.statusQuietHint',
    className: 'border-border bg-muted/50 text-muted-foreground',
  },
};

export function HealthStatusBanner({ status }: { status: HealthStatus }) {
  const { t } = useTranslation();
  const { icon: Icon, title, hint, className } = PRESENTATION[status];

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4 shadow-sm', className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold">{t(title)}</p>
        <p className="text-xs opacity-80">{t(hint)}</p>
      </div>
    </div>
  );
}
