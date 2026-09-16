'use client';

import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { Switch } from '@/components/ui/switch';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

interface ClassSellingFieldsProps {
  idPrefix: string;
  capacity: number;
  seatPrice: string;
  /** The course's per-seat offer price, used when the class has no override. */
  offerPrice?: number | null;
  wholeClassBooking: boolean;
  seatsHeld?: number;
  onSeatPriceChange: (value: string) => void;
  onWholeClassBookingChange: (value: boolean) => void;
}

/**
 * What a seat costs and how the class may be bought — shown exactly the way
 * the student will see it at checkout, so the manager prices with open eyes.
 */
export function ClassSellingFields({
  idPrefix,
  capacity,
  seatPrice,
  offerPrice,
  wholeClassBooking,
  seatsHeld = 0,
  onSeatPriceChange,
  onWholeClassBookingChange,
}: ClassSellingFieldsProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatNumber = useNumberFormat();
  const effectivePrice = seatPrice === '' ? (offerPrice ?? 0) : Number(seatPrice);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-seat-price`}>{t('courses.live.seatPrice')}</Label>
        <PriceInput
          id={`${idPrefix}-seat-price`}
          value={seatPrice}
          placeholder={offerPrice != null ? String(offerPrice) : undefined}
          onChange={onSeatPriceChange}
        />
      </div>

      {capacity > 1 ? (
        <p className="text-sm">
          <span className="text-muted-foreground">
            {t('courses.live.wholeClassPrice', {
              count: formatNumber(capacity),
            })}
            :
          </span>{' '}
          <span className="font-semibold">{formatCurrency(effectivePrice * capacity)}</span>
        </p>
      ) : null}

      {capacity > 1 ? (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <Label htmlFor={`${idPrefix}-whole-class`}>
              {t('tutoring.groups.wholeClassBooking')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('tutoring.groups.wholeClassBookingHint')}
            </p>
          </div>
          <Switch
            id={`${idPrefix}-whole-class`}
            checked={wholeClassBooking}
            onCheckedChange={onWholeClassBookingChange}
          />
        </div>
      ) : null}

      {seatsHeld > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t('courses.live.seatsHeld', { held: formatNumber(seatsHeld) })} ·{' '}
          {t('courses.live.heldHint')}
        </p>
      ) : null}
    </div>
  );
}
