'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { Switch } from '@/components/ui/switch';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { cn } from '@/lib/utils';

interface ClassSellingFieldsProps {
  idPrefix: string;
  capacity: number;
  seatPrice: string;
  /** The course's per-seat offer price, used when the class has no override. */
  offerPrice?: number | null;
  wholeClassBooking: boolean;
  seatsHeld?: number;
  className?: string;
  onSeatPriceChange: (value: string) => void;
  onWholeClassBookingChange: (value: boolean) => void;
}

/**
 * The override input. Empty means "charge the course price", and the reset
 * link puts a class back on it in one click.
 */
function SeatPriceField({
  id,
  seatPrice,
  offerPrice,
  onChange,
}: {
  id: string;
  seatPrice: string;
  offerPrice?: number | null;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatNumber = useNumberFormat();
  const hasCoursePrice = offerPrice != null;
  const isOverridden = seatPrice !== '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {t('courses.live.seatPrice')}
          {hasCoursePrice ? (
            <span className="ms-1 font-normal text-muted-foreground">({t('common.optional')})</span>
          ) : null}
        </Label>
        {hasCoursePrice && isOverridden ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => onChange('')}
          >
            {t('courses.live.useCoursePrice')}
          </Button>
        ) : null}
      </div>
      <PriceInput
        id={id}
        value={seatPrice}
        placeholder={hasCoursePrice ? formatNumber(offerPrice) : undefined}
        onChange={onChange}
      />
      {hasCoursePrice ? (
        <p className="text-xs text-muted-foreground">
          {isOverridden
            ? t('courses.live.seatPriceOverrideHint', { price: formatCurrency(offerPrice) })
            : t('courses.live.seatPriceInheritHint', { price: formatCurrency(offerPrice) })}
        </p>
      ) : null}
    </div>
  );
}

/**
 * What a seat costs and how the class may be bought — shown exactly the way
 * the student will see it at checkout, so the manager prices with open eyes.
 * The price is an optional override: empty means the course's seat price,
 * which is what the server charges (`seat_price ?? Offer.price`).
 */
export function ClassSellingFields({
  idPrefix,
  capacity,
  seatPrice,
  offerPrice,
  wholeClassBooking,
  seatsHeld = 0,
  className,
  onSeatPriceChange,
  onWholeClassBookingChange,
}: ClassSellingFieldsProps) {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const formatNumber = useNumberFormat();
  const effectivePrice = seatPrice === '' ? (offerPrice ?? 0) : Number(seatPrice);

  return (
    <div className={cn('space-y-4 rounded-lg border p-4', className)}>
      <SeatPriceField
        id={`${idPrefix}-seat-price`}
        seatPrice={seatPrice}
        offerPrice={offerPrice}
        onChange={onSeatPriceChange}
      />

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
