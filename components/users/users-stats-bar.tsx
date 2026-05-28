'use client';

import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

type Stat = { labelKey: string; value: number; delta?: number };

export function UsersStatsBar({ stats }: { stats: Stat[] }) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t(s.labelKey)}
            </span>
            {s.delta !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  s.delta >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                <TrendingUp style={{ width: 10, height: 10 }} />
                {Math.abs(s.delta).toLocaleString('fa-IR')}٪
              </span>
            )}
          </div>
          <div className="font-mono text-[26px] font-bold tracking-tight">
            {s.value.toLocaleString('fa-IR')}
          </div>
        </div>
      ))}
    </div>
  );
}
