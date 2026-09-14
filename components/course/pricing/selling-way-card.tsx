'use client';

import type { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { discountPercent } from './discount';

export type SellingWayCardProps = {
  label: string;
  /** Where the price is stored, e.g. "the course's own price". */
  note?: string;
  price: number;
  beforeDiscount: number | null;
  /** Free ways show no amount at all. */
  isFree: boolean;
  termLabel: string;
  /** Shown as a badge when this way excludes the live class. */
  recordedOnly?: boolean;
  isActive?: boolean;
  onToggleActive?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  /** Why delete is unavailable on this card — shown on hover. */
  removeDisabledReason?: string;
  disabled?: boolean;
  /** When set, the switch and delete are blocked and this explains why. */
  lockReason?: string;
  /** Replaces the actions when the way is owned by another screen. */
  footer?: ReactNode;
};

/**
 * One way this course can be bought, with the price that way charges. Every row
 * inside keeps a fixed height so a grid of these cards lines up: title, amount,
 * discount, term, then the actions pinned to the bottom edge.
 */
export function SellingWayCard({
  label,
  note,
  price,
  beforeDiscount,
  isFree,
  termLabel,
  recordedOnly = false,
  isActive,
  onToggleActive,
  onEdit,
  onRemove,
  removeDisabledReason,
  disabled = false,
  lockReason,
  footer,
}: SellingWayCardProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const percent = discountPercent(price, beforeDiscount);
  const locked = Boolean(lockReason);

  return (
    <div
      className={`flex h-full flex-col rounded-lg border p-4 ${
        isActive === false ? 'opacity-60' : ''
      }`}
    >
      {/* The switch column is always reserved, so titles line up across cards */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="mt-0.5 h-4 truncate text-xs text-muted-foreground">{note ?? ''}</p>
        </div>
        <div className="h-6 w-9 shrink-0">
          {onToggleActive && (
            <Switch
              checked={Boolean(isActive)}
              disabled={disabled || locked}
              onCheckedChange={onToggleActive}
              aria-label={t('courses.offeringActive')}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        {isFree ? (
          <span className="text-xl font-bold text-emerald-600">{t('courses.offeringFREE')}</span>
        ) : (
          <>
            <span className="text-xl font-bold tabular-nums">{formatNumber(price)}</span>
            <span className="text-xs text-muted-foreground">{t('courses.toman')}</span>
          </>
        )}
      </div>

      {/* Reserved row: a card with no discount keeps the same height */}
      <div className="mt-1 flex h-6 items-center gap-2">
        {beforeDiscount !== null && percent !== null && (
          <>
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              {formatNumber(beforeDiscount)}
            </span>
            <Badge variant="secondary" className="tabular-nums">
              {t('courses.discountBadge', { percent })}
            </Badge>
          </>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{termLabel}</span>
        {recordedOnly && (
          <Badge variant="outline" className="text-[11px]">
            {t('courses.recordedOnly')}
          </Badge>
        )}
      </div>

      {locked && <p className="mt-2 text-[11px] text-amber-600">{lockReason}</p>}

      {footer ?? (
        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1"
            disabled={disabled || !onEdit}
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('common.edit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1 text-destructive hover:text-destructive"
            disabled={disabled || locked || !onRemove}
            title={locked ? lockReason : removeDisabledReason}
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('common.delete')}
          </Button>
        </div>
      )}
    </div>
  );
}
