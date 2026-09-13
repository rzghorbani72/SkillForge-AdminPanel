'use client';

import Link from 'next/link';
import { Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringOffer } from '@/types/learning-operations';
import { SellingWayCard } from './selling-way-card';

type Props = {
  courseId: string;
  /** GROUP = a seat in the class, SOLO = the teacher to yourself. */
  offers: TutoringOffer[];
  termLabel: (days: number | null) => string;
};

/**
 * A live course is not bought once and watched later: it is either open to
 * everyone or a seat is reserved in it. Both seat prices belong to the class
 * itself, so they are shown here read-only and edited on the Classroom step.
 */
export function LiveSeatCards({ courseId, offers, termLabel }: Props) {
  const { t } = useTranslation();
  const classPage = `/courses/${courseId}/edit?step=classroom`;

  const openClassPage = (
    <div className="mt-auto border-t pt-3">
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href={classPage}>{t('courses.openLiveClassPage')}</Link>
      </Button>
    </div>
  );

  if (offers.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-dashed p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">{t('courses.seatPricing')}</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('courses.seatPricingEmpty')}
        </p>
        {openClassPage}
      </div>
    );
  }

  return (
    <>
      {offers.map((offer) => (
        <SellingWayCard
          key={offer.id}
          label={t(
            offer.kind === 'SOLO' ? 'courses.live.solo' : 'courses.live.group'
          )}
          note={t('courses.seatPricedOnClassPage')}
          price={offer.price}
          beforeDiscount={null}
          isFree={offer.price === 0}
          termLabel={termLabel(offer.duration_days ?? null)}
          footer={openClassPage}
        />
      ))}
    </>
  );
}
