'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { cn, formatCurrencyWithStore } from '@/lib/utils';

const NUMBER_RUN = /[\d۰-۹٬,.]+/;

/** "۸۵۴٬۲۵۰ تومان" → { amount: "۸۵۴٬۲۵۰", unit: "تومان" } for any symbol position. */
export function splitMoney(formatted: string): {
  amount: string;
  unit: string;
} {
  const match = NUMBER_RUN.exec(formatted);
  if (!match) return { amount: formatted, unit: '' };
  const unit = (
    formatted.slice(0, match.index) + formatted.slice(match.index + match[0].length)
  ).trim();
  return { amount: match[0], unit };
}

type Props = { value: number; className?: string };

/** A money figure with the currency unit small and gray; className colors the number. */
export function MoneyValue({ value, className }: Props) {
  const { language } = useTranslation();
  const academy = useCurrentAcademy();
  const { amount, unit } = splitMoney(formatCurrencyWithStore(value, academy, undefined, language));
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={cn('text-2xl font-bold tracking-tight', className)}>{amount}</span>
      {unit ? <span className="text-xs font-normal text-muted-foreground">{unit}</span> : null}
    </span>
  );
}
