'use client';

import { User, Users } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { ClassPlanSeatsNote } from '@/components/class/class-plan-seats-note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { MAX_CLASS_CAPACITY } from '@/lib/live-room';
import { seatCount } from './live-class-draft';
import { FieldError, OptionCard, RiskHint } from './live-ui';
import type { LiveClassDraftApi } from './use-live-class-draft';

export function StepClassType({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { draft, shownErrors: errors, update, group } = live;
  const isPrivate = draft.kind === 'PRIVATE';
  const price = Number(draft.price) || 0;
  const sessions = Number(draft.sessionCount) || 0;
  const seatsSold = group?.seats_taken ?? 0;
  const priceChanged =
    group !== null && draft.price !== String(group.seat_price ?? group.Offer?.price ?? '');
  const toman = t('common.toman');

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">{t('liveWizard.whoIsItFor')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            selected={isPrivate}
            onSelect={() => update({ kind: 'PRIVATE' })}
            icon={User}
            title={t('liveWizard.privateTitle')}
            hint={t('liveWizard.privateHint')}
            disabled={seatsSold > 1}
          />
          <OptionCard
            selected={!isPrivate}
            onSelect={() => update({ kind: 'GROUP' })}
            icon={Users}
            title={t('liveWizard.groupTitle')}
            hint={t('liveWizard.groupHint')}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">
          {t(isPrivate ? 'liveWizard.privateTitle' : 'liveWizard.groupTitle')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="live-price">
              {t(isPrivate ? 'liveWizard.privatePrice' : 'liveWizard.seatPrice')} *
            </Label>
            <PriceInput
              id="live-price"
              value={draft.price}
              onChange={(value) => update({ price: value })}
              suffix={toman}
            />
            {price > 0 && sessions > 0 ? (
              <p className="text-xs text-muted-foreground">
                {t('liveWizard.perSession', {
                  count: formatNumber(sessions),
                  price: formatNumber(Math.round(price / sessions)),
                })}
              </p>
            ) : null}
            <FieldError messageKey={errors.price} />
          </div>
          {!isPrivate ? (
            <div className="space-y-1.5">
              <Label htmlFor="live-capacity">{t('liveWizard.capacity')} *</Label>
              <NumberInput
                id="live-capacity"
                value={draft.capacity}
                min={Math.max(2, seatsSold)}
                max={MAX_CLASS_CAPACITY}
                onChange={(capacity) => update({ capacity })}
              />
              <p className="text-xs text-muted-foreground">
                {t('liveWizard.capacityHint', { max: formatNumber(MAX_CLASS_CAPACITY) })}
              </p>
              <FieldError messageKey={errors.capacity} />
            </div>
          ) : null}
        </div>

        {price > 0 ? (
          <RiskHint>
            {t(isPrivate ? 'liveWizard.privateRevenue' : 'liveWizard.groupRevenue', {
              total: formatNumber(price * seatCount(draft)),
            })}
          </RiskHint>
        ) : null}
        {draft.price === '0' ? (
          <RiskHint tone="warn">{t('liveWizard.freeClassWarning')}</RiskHint>
        ) : null}
        {priceChanged && seatsSold > 0 ? (
          <RiskHint tone="warn">{t('liveWizard.priceChangeWarning')}</RiskHint>
        ) : null}
        {isPrivate ? <RiskHint>{t('liveWizard.privateOneSeat')}</RiskHint> : null}
        <ClassPlanSeatsNote />
      </section>
    </div>
  );
}
