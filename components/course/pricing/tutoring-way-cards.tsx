'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringOffer } from '@/types/learning-operations';
import { SellingWayCard } from './selling-way-card';

type Props = {
  offers: TutoringOffer[];
  termLabel: (days: number | null) => string;
};

/**
 * Private 1:1 on a recorded course, read-only: it needs a tutor, so it is
 * priced on the tutoring page and only shown here so one screen lists every
 * price the course charges.
 */
export function TutoringWayCards({ offers, termLabel }: Props) {
  const { t } = useTranslation();

  return (
    <>
      {offers.map((offer) => (
        <SellingWayCard
          key={offer.id}
          label={offer.title}
          note={t('courses.tutoringPricedElsewhere')}
          price={offer.price}
          beforeDiscount={null}
          isFree={false}
          termLabel={termLabel(offer.duration_days ?? null)}
          footer={
            <div className="mt-auto border-t pt-3">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/tutoring">{t('courses.openTutoringPage')}</Link>
              </Button>
            </div>
          }
        />
      ))}
    </>
  );
}
