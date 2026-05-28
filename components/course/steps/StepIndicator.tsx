'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { STEP_KEYS } from './course-modal-types';

export function StepIndicator({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-0 border-b border-border px-6 py-4">
      {STEP_KEYS.map((s, idx) => {
        const done = step > s.n;
        const current = step === s.n;
        return (
          <>
            <div key={s.n} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                  done
                    ? 'bg-emerald-500 text-white'
                    : current
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground/40'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.n}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  current ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {t(s.labelKey)}
              </span>
            </div>
            {idx < STEP_KEYS.length - 1 && (
              <div
                key={`sep-${s.n}`}
                className={cn(
                  'mb-5 h-px w-12 transition-colors',
                  done ? 'bg-emerald-400' : 'bg-border'
                )}
              />
            )}
          </>
        );
      })}
    </div>
  );
}
