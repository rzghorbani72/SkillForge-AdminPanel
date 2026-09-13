'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Offer, OfferInput, OfferingType } from '@/types/api';

import { isBeforeDiscountValid } from './discount';

// PRIVATE and PAYMENT_PLAN are excluded: private tutoring is sold from the
// tutoring page (it needs a tutor), and installments will arrive as a Snapp Pay
// gateway integration rather than an offer type. The API refuses both.
export const ADDABLE_OFFER_TYPES: readonly OfferingType[] = [
  'ONE_TIME',
  'SUBSCRIPTION',
  'FREE'
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null = adding a new way to sell. */
  offer: Offer | null;
  /** Types this course already sells — offered once each, so they drop off the list. */
  takenTypes: readonly OfferingType[];
  /** Types this course may sell at all: a live course only ever adds FREE. */
  addableTypes?: readonly OfferingType[];
  onSubmit: (values: Omit<OfferInput, 'course_ids'>) => Promise<void>;
};

/** Add or edit one way to sell this course, with the price that way charges. */
export function OfferDialog({
  open,
  onOpenChange,
  offer,
  takenTypes,
  addableTypes = ADDABLE_OFFER_TYPES,
  onSubmit
}: Props) {
  const { t } = useTranslation();
  const [type, setType] = useState<OfferingType>('ONE_TIME');
  const [price, setPrice] = useState('');
  const [beforeDiscount, setBeforeDiscount] = useState('');
  const [accessDays, setAccessDays] = useState('');
  const [includesLive, setIncludesLive] = useState(true);
  const [saving, setSaving] = useState(false);

  // The way being edited keeps its own type; every other used type is gone.
  const availableTypes = addableTypes.filter(
    (ot) => ot === offer?.type || !takenTypes.includes(ot)
  );

  useEffect(() => {
    if (!open) return;
    setType(offer?.type ?? availableTypes[0] ?? 'ONE_TIME');
    setPrice(offer ? String(offer.price) : '');
    setBeforeDiscount(
      offer?.compare_at_price ? String(offer.compare_at_price) : ''
    );
    setAccessDays(
      offer?.access_duration_days ? String(offer.access_duration_days) : ''
    );
    setIncludesLive(offer?.includes_live ?? true);
  }, [open, offer]);

  const isFree = type === 'FREE';
  const priceMissing = !isFree && (!price || Number(price) <= 0);
  const beforeDiscountInvalid =
    !isFree && !isBeforeDiscountValid(Number(price), Number(beforeDiscount));

  const submit = async () => {
    if (priceMissing || beforeDiscountInvalid) return;
    setSaving(true);
    try {
      await onSubmit({
        type,
        price: isFree ? 0 : Number(price),
        compare_at_price: isFree ? null : Number(beforeDiscount) || null,
        access_duration_days: Number(accessDays) || null,
        includes_live: includesLive
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {offer ? t('courses.editSellingWay') : t('courses.addOffering')}
          </DialogTitle>
          <DialogDescription>
            {t('courses.sellingWayDialogHint')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('courses.offeringType')}</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as OfferingType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((ot) => (
                  <SelectItem key={ot} value={ot}>
                    {t(`courses.offering${ot}` as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {t('courses.offeringTypeHint')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>{t('courses.offeringAccessDays')}</Label>
            <NumberInput
              placeholder={t('courses.accessAcademyLifetime')}
              value={accessDays}
              onChange={setAccessDays}
            />
            <p className="text-[11px] text-muted-foreground">
              {t('courses.accessAcademyLifetimeHint')}
            </p>
          </div>

          {!isFree && (
            <>
              <div className="space-y-1.5">
                <Label>{t('courses.salePrice')} *</Label>
                <PriceInput value={price} onChange={setPrice} />
                {priceMissing && (
                  <p className="text-[11px] text-amber-600">
                    {t('courses.offeringPriceRequired')}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{t('courses.priceBeforeDiscount')}</Label>
                <PriceInput
                  value={beforeDiscount}
                  onChange={setBeforeDiscount}
                />
                <p
                  className={`text-[11px] ${beforeDiscountInvalid ? 'text-amber-600' : 'text-muted-foreground'}`}
                >
                  {beforeDiscountInvalid
                    ? t('courses.priceBeforeDiscountInvalid')
                    : t('courses.priceBeforeDiscountHint')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="includes-live">{t('courses.includesLive')}</Label>
            <p className="text-[11px] text-muted-foreground">
              {includesLive
                ? t('courses.includesLiveOnHint')
                : t('courses.includesLiveOffHint')}
            </p>
          </div>
          <Switch
            id="includes-live"
            checked={includesLive}
            onCheckedChange={setIncludesLive}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={
              saving ||
              priceMissing ||
              beforeDiscountInvalid ||
              availableTypes.length === 0
            }
          >
            {offer ? t('common.saveChanges') : t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
