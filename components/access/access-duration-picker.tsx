'use client';

import { Infinity as InfinityIcon, CalendarDays, Timer } from 'lucide-react';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { AccessDuration } from '@/lib/api-extra';

const DAY_PRESETS = [30, 90, 180, 365] as const;

type AccessDurationPickerProps = {
  value: AccessDuration;
  onChange: (value: AccessDuration) => void;
  disabled?: boolean;
};

const MODE_ICONS = {
  days: Timer,
  until: CalendarDays,
  forever: InfinityIcon
} as const;

/**
 * How long a hand-given grant lasts. "Forever" is a real never-expiring grant,
 * so it is called out rather than hidden behind a large day count.
 */
export function AccessDurationPicker({
  value,
  onChange,
  disabled = false
}: AccessDurationPickerProps) {
  const { t } = useTranslation();

  const modes = [
    { mode: 'days', label: t('accessGrants.durationDays') },
    { mode: 'until', label: t('accessGrants.durationUntil') },
    { mode: 'forever', label: t('accessGrants.durationForever') }
  ] as const;

  return (
    <div className="space-y-3">
      <Label>{t('accessGrants.duration')}</Label>

      <div className="grid grid-cols-3 gap-2">
        {modes.map(({ mode, label }) => {
          const Icon = MODE_ICONS[mode];
          const isActive = value.mode === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={disabled}
              onClick={() => onChange(defaultForMode(mode))}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm transition-colors disabled:opacity-50',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:bg-muted/40'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {value.mode === 'days' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ mode: 'days', days: preset })}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50',
                  value.days === preset
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:bg-muted/40'
                )}
              >
                {t('accessGrants.dayCount', { count: preset })}
              </button>
            ))}
          </div>
          <NumberInput
            disabled={disabled}
            value={value.days}
            onChange={(raw) =>
              onChange({ mode: 'days', days: raw === '' ? 0 : Number(raw) })
            }
            aria-label={t('accessGrants.durationDays')}
            className="h-9 max-w-[8.5rem]"
          />
        </div>
      )}

      {value.mode === 'until' && (
        <DatePicker
          disabled={disabled}
          value={value.until.slice(0, 10)}
          onChange={(pickedValue: string) =>
            onChange({
              mode: 'until',
              until: new Date(`${pickedValue}T23:59:59`).toISOString()
            })
          }
          aria-label={t('accessGrants.durationUntil')}
          className="h-9 max-w-[12rem]"
        />
      )}

      {value.mode === 'forever' && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          {t('accessGrants.foreverWarning')}
        </p>
      )}
    </div>
  );
}

function defaultForMode(mode: AccessDuration['mode']): AccessDuration {
  if (mode === 'forever') return { mode: 'forever' };
  if (mode === 'until') {
    const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return { mode: 'until', until: inThirtyDays.toISOString() };
  }
  return { mode: 'days', days: 365 };
}
