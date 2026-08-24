'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  TutoringOffer,
  TutoringOfferKind
} from '@/types/learning-operations';

interface LivePricingCardProps {
  courseId: string;
  courseTitle: string;
  tutorProfileId: string;
  offers: TutoringOffer[];
  onSaved: (offers: TutoringOffer[]) => void;
}

const priceOf = (offers: TutoringOffer[], kind: TutoringOfferKind) =>
  String(offers.find((offer) => offer.kind === kind)?.price ?? '');

/**
 * The two ways a live course sells: a seat in a class, or the teacher alone.
 * Both are tutoring offers, so a class can be scheduled against the group one
 * the moment it exists.
 */
export default function LivePricingCard({
  courseId,
  courseTitle,
  tutorProfileId,
  offers,
  onSaved
}: LivePricingCardProps) {
  const { t } = useTranslation();
  const [groupPrice, setGroupPrice] = useState(priceOf(offers, 'GROUP'));
  const [soloPrice, setSoloPrice] = useState(priceOf(offers, 'SOLO'));
  const [isSaving, setIsSaving] = useState(false);

  const saveOne = async (kind: TutoringOfferKind, raw: string) => {
    const price = Number(raw || 0);
    const existing = offers.find((offer) => offer.kind === kind);
    if (existing) {
      if (existing.price === price) return existing;
      return apiClient.updateTutoringOffer(existing.id, { price });
    }
    return apiClient.createTutoringOffer({
      course_id: courseId,
      tutor_profile_id: tutorProfileId,
      kind,
      title: `${courseTitle} — ${t(`courses.live.${kind === 'SOLO' ? 'solo' : 'group'}`)}`,
      price
    });
  };

  const save = async () => {
    if (!groupPrice && !soloPrice) {
      toast.error(t('courses.live.pricesRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const saved: TutoringOffer[] = [];
      if (groupPrice) saved.push(await saveOne('GROUP', groupPrice));
      if (soloPrice) saved.push(await saveOne('SOLO', soloPrice));
      onSaved(saved);
      toast.success(t('courses.live.pricesSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('courses.live.pricing')}</CardTitle>
        <CardDescription>{t('courses.live.pricingHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="group-price">
              {t('courses.live.groupPrice')} *
            </Label>
            <PriceInput
              id="group-price"
              value={groupPrice}
              onChange={setGroupPrice}
              suffix={t('common.toman')}
            />
            <p className="text-xs text-muted-foreground">
              {t('courses.live.groupPriceHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="solo-price">{t('courses.live.soloPrice')}</Label>
            <PriceInput
              id="solo-price"
              value={soloPrice}
              onChange={setSoloPrice}
              suffix={t('common.toman')}
            />
            <p className="text-xs text-muted-foreground">
              {t('courses.live.soloPriceHint')}
            </p>
          </div>
        </div>
        <Button type="button" size="sm" onClick={save} disabled={isSaving}>
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
