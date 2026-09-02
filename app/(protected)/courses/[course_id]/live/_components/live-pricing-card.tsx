'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { SetupCard } from '@/components/course/live/setup-card';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { queryKeys } from '@/lib/query/keys';
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

type SavedOffer = TutoringOffer & { feature_enabled_now?: boolean };

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
  const queryClient = useQueryClient();
  const academyId = useCurrentAcademyId();
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
      const saved: SavedOffer[] = [];
      if (groupPrice) saved.push(await saveOne('GROUP', groupPrice));
      if (soloPrice) saved.push(await saveOne('SOLO', soloPrice));
      onSaved(saved);

      // Pricing a live course is itself the decision to sell classes, so the
      // server turns that on rather than blocking the save. Say so, because it
      // also adds the class pages to the sidebar.
      if (saved.some((offer) => offer.feature_enabled_now)) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.learningNavCapabilities(academyId)
        });
        toast.success(
          <span>
            {t('courses.live.pricesSavedAndSellingEnabled')}{' '}
            <Link href="/settings/academy" className="underline">
              {t('courses.live.openAcademySettings')}
            </Link>
          </span>
        );
      } else {
        toast.success(t('courses.live.pricesSaved'));
      }
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const dirty =
    groupPrice !== priceOf(offers, 'GROUP') ||
    soloPrice !== priceOf(offers, 'SOLO');

  return (
    <SetupCard
      step={2}
      title={t('courses.live.pricing')}
      description={t('courses.live.pricingHint')}
      done={offers.length > 0 && !dirty}
      dirty={dirty}
    >
      <div className="space-y-4">
        <div className="grid gap-4">
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
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={isSaving || !dirty}
        >
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </SetupCard>
  );
}
