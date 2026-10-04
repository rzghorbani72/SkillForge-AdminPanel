'use client';

import { User, Users } from 'lucide-react';

import { NumberInput } from '@/components/ui/number-input';
import { PriceInput } from '@/components/ui/price-input';
import { ClassPlanSeatsNote } from '@/components/class/class-plan-seats-note';
import { Note } from '@/components/shared/note';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { seatCount } from './live-class-draft';
import { ChoiceCard } from '@/components/shared/choice-card';
import { FieldError, FieldLabel } from '@/components/shared/field-label';
import { SectionCard } from '@/components/shared/section-card';
import type { LiveClassDraftApi } from './use-live-class-draft';

export function StepClassType({ live }: { live: LiveClassDraftApi }) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const { draft, shownErrors: errors, update, groups } = live;
  const isPrivate = draft.kind === 'PRIVATE';
  const price = Number(draft.price) || 0;
  const sessions = Number(draft.classes[0]?.sessionCount) || 0;
  const seatsSold = Math.max(0, ...groups.map((group) => group.seats_taken ?? 0));
  const priceChanged = groups.some(
    (group) => draft.price !== String(group.seat_price ?? group.Offer?.price ?? ''),
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title={t('liveWizard.whoIsItFor')} hint={t('liveWizard.whoIsItForHint')}>
        <div role="radiogroup" className="grid gap-4 sm:grid-cols-2">
          <ChoiceCard
            selected={isPrivate}
            onSelect={() => update({ kind: 'PRIVATE' })}
            icon={User}
            title={t('liveWizard.privateTitle')}
            hint={t('liveWizard.privateHint')}
            disabled={seatsSold > 1}
          />
          <ChoiceCard
            selected={!isPrivate}
            onSelect={() => update({ kind: 'GROUP' })}
            icon={Users}
            title={t('liveWizard.groupTitle')}
            hint={t('liveWizard.groupHint')}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={isPrivate ? User : Users}
        title={t(isPrivate ? 'liveWizard.privateTitle' : 'liveWizard.groupTitle')}
        hint={
          isPrivate
            ? t('liveWizard.privateCardHint', { count: formatNumber(sessions) })
            : t('liveWizard.groupCardHint')
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="live-price" required>
              {t(isPrivate ? 'liveWizard.privatePrice' : 'liveWizard.seatPrice')}
            </FieldLabel>
            <PriceInput
              id="live-price"
              value={draft.price}
              onChange={(value) => update({ price: value })}
              suffix={t(isPrivate ? 'common.toman' : 'liveWizard.tomanPerSeat')}
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
          {isPrivate ? null : (
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="live-capacity" required>
                {t('liveWizard.capacity')}
              </FieldLabel>
              <NumberInput
                id="live-capacity"
                value={draft.capacity}
                min={Math.max(2, seatsSold)}
                max={live.maxCapacity}
                suffix={t('liveWizard.personUnit')}
                onChange={(capacity) => update({ capacity })}
              />
              <p className="text-xs text-muted-foreground">
                {t('liveWizard.capacityHint', { max: formatNumber(live.maxCapacity) })}
              </p>
              <FieldError messageKey={errors.capacity} />
            </div>
          )}
        </div>

        {price > 0 ? (
          <Note>
            {t(isPrivate ? 'liveWizard.privateRevenue' : 'liveWizard.groupRevenue', {
              total: formatNumber(price * seatCount(draft)),
            })}
          </Note>
        ) : null}
        {draft.price === '0' ? <Note tone="warn">{t('liveWizard.freeClassWarning')}</Note> : null}
        {priceChanged && seatsSold > 0 ? (
          <Note tone="warn">{t('liveWizard.priceChangeWarning')}</Note>
        ) : null}
        {isPrivate ? <Note>{t('liveWizard.privateOneSeat')}</Note> : null}
      </SectionCard>

      <ClassPlanSeatsNote />
    </div>
  );
}
