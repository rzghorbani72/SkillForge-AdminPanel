'use client';

import type { ReactNode } from 'react';
import { Info, TriangleAlert, type LucideIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export function FieldError({ messageKey }: { messageKey?: string }) {
  const { t } = useTranslation();
  if (!messageKey) return null;
  return <p className="text-xs font-medium text-destructive">{t(messageKey)}</p>;
}

type OptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  icon: LucideIcon;
  title: string;
  hint: string;
  badge?: string;
  disabled?: boolean;
};

export function OptionCard({
  selected,
  onSelect,
  icon: Icon,
  title,
  hint,
  badge,
  disabled,
}: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-start transition-colors disabled:opacity-60',
        selected ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent',
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {title}
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

/** A plain-language note next to a choice that carries a real risk or cost. */
export function RiskHint({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn';
  children: ReactNode;
}) {
  const Icon = tone === 'warn' ? TriangleAlert : Info;
  return (
    <Alert
      className={cn(
        'py-3',
        tone === 'warn'
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 [&>svg]:text-amber-600'
          : 'border-primary/20 bg-primary/5 [&>svg]:text-primary',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <AlertDescription className="text-sm leading-relaxed">{children}</AlertDescription>
    </Alert>
  );
}
