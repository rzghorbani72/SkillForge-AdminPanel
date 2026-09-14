'use client';

import { AlertTriangle } from 'lucide-react';

import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';

interface PriceLadderPreviewProps {
  groupPrice: number;
  soloPrice: number;
}

/**
 * The price ladder as the student sees it: private 1:1, a seat in a small
 * group, a seat in a public class, and a class bought whole. A 1:1 priced
 * below a seat can never move into a class, so that gets a warning.
 */
export function PriceLadderPreview({ groupPrice, soloPrice }: PriceLadderPreviewProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  if (!groupPrice && !soloPrice) return null;

  const rows = [
    soloPrice ? { label: t('courses.live.priceLadderPrivate'), value: soloPrice } : null,
    groupPrice ? { label: t('courses.live.priceLadderSmall'), value: groupPrice } : null,
    groupPrice ? { label: t('courses.live.priceLadderPublic'), value: groupPrice } : null,
  ].filter((row): row is { label: string; value: number } => row !== null);

  return (
    <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
      <p className="text-xs font-medium text-muted-foreground">
        {t('courses.live.priceLadderTitle')}
      </p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold">{formatCurrency(row.value)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{t('courses.live.priceLadderWhole')}</p>
      {soloPrice > 0 && groupPrice > 0 && soloPrice < groupPrice ? (
        <p className="flex items-start gap-1.5 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('courses.live.soloBelowGroupWarning')}
        </p>
      ) : null}
    </div>
  );
}
