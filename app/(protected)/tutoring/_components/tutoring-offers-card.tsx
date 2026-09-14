'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringOffer } from '@/types/learning-operations';

interface TutoringOffersCardProps {
  offers: TutoringOffer[];
  loading: boolean;
  saving: boolean;
  onToggleActive: (offer: TutoringOffer) => void;
}

export function TutoringOffersCard({
  offers,
  loading,
  saving,
  onToggleActive,
}: TutoringOffersCardProps) {
  const { t, language } = useTranslation();
  const priceFormatter = new Intl.NumberFormat(language);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.offers')}</CardTitle>
        <CardDescription>{t('tutoring.offersDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex min-h-24 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('tutoring.noOffers')}</p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{offer.title}</p>
                <p className="text-sm text-muted-foreground">
                  {offer.Course?.title ?? offer.course_id} ·{' '}
                  {offer.Tutor?.display_name ?? offer.tutor_profile_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  {priceFormatter.format(offer.price)} {offer.currency}
                  {offer.duration_days
                    ? ` · ${t('tutoring.durationDaysLabel', {
                        days: String(offer.duration_days),
                      })}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={offer.is_active ? 'default' : 'outline'}>
                  {offer.is_active ? t('tutoring.offerActive') : t('tutoring.offerInactive')}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => void onToggleActive(offer)}
                >
                  {offer.is_active ? t('tutoring.deactivate') : t('tutoring.activate')}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
