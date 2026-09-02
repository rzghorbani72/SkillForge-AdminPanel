'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { useCourseOffers } from '@/hooks/use-course-offers';
import { accessTermDays } from '@/lib/access-term';
import type { Offer, OfferInput, OfferingType } from '@/types/api';
import type { CourseType } from '../course-drafts';
import type { CourseFormData } from '../schema';
import { SellingWayCard } from './selling-way-card';
import { ADDABLE_OFFER_TYPES, OfferDialog } from './offer-dialog';
import { BasePriceDialog } from './base-price-dialog';
import { LiveSeatCards } from './live-seat-cards';
import { TutoringWayCards } from './tutoring-way-cards';
import { useCourseTutoringOffers } from './use-course-tutoring-offers';

type Props = {
  courseId: string;
  form: UseFormReturn<CourseFormData>;
  courseType?: CourseType;
};

/**
 * Every price this course charges, one card per way of selling it. Prices are
 * edited in a dialog so the page shows the prices that exist instead of a row of
 * empty inputs.
 */
export function CoursePricingSection({
  courseId,
  form,
  courseType = 'OFFLINE'
}: Props) {
  const { t } = useTranslation();
  const { offers, isSaving, create, update, toggleActive, remove } =
    useCourseOffers(courseId);
  const tutoringOffers = useCourseTutoringOffers(courseId);

  // A live course is attended, not watched later: it is either open to everyone
  // or a seat in it is reserved. One-time and subscription belong to recorded
  // courses, and its base price is never a selling way (the server keeps
  // `base_price_active` off for LIVE).
  const isLive = courseType === 'LIVE';
  const addableTypes: readonly OfferingType[] = isLive
    ? ['FREE']
    : ADDABLE_OFFER_TYPES;

  const [basePriceOpen, setBasePriceOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);

  // The course's base price already has its own card, so its mirrored offer is
  // not listed twice.
  const extraOffers = offers.filter((o) => o.source_course_id === null);

  const basePrice = Number(form.watch('primary_price') || 0);
  const baseBeforeDiscount = Number(form.watch('secondary_price') || 0) || null;
  const basePriceActive = form.watch('base_price_active');

  // A published course must keep one way to enrol — the same rule the server
  // enforces. Locking the last card explains it before the request fails.
  const activeWays =
    (!isLive && basePriceActive ? 1 : 0) +
    extraOffers.filter((o) => o.is_active).length +
    tutoringOffers.filter((o) => o.is_active).length;
  const lockReason =
    form.watch('published') && activeWays <= 1
      ? t('courses.lastSellingWayLocked')
      : undefined;

  // Each type is sold once per course: the base price already takes ONE_TIME (or
  // FREE when it is zero), so those drop off the list when adding a new way.
  const baseType: OfferingType = basePrice === 0 ? 'FREE' : 'ONE_TIME';
  const takenTypes: OfferingType[] = [
    ...(!isLive && basePriceActive ? [baseType] : []),
    ...extraOffers.map((o) => o.type)
  ];
  const allTypesTaken = addableTypes.every((ot) => takenTypes.includes(ot));

  const openAdd = () => {
    setEditing(null);
    setOfferDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setOfferDialogOpen(true);
  };

  const submitOffer = async (values: Omit<OfferInput, 'course_ids'>) => {
    if (editing) await update(editing.id, values);
    else await create(values);
  };

  // No stated term = the academy's active lifetime, which is what the backend
  // grants — never invent a day count here.
  const termLabel = (days: number | null) => {
    const stated = accessTermDays(days, null);
    return stated === null
      ? t('courses.accessAcademyLifetime')
      : t('courses.offeringAccessDaysValue', { days: stated });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>{t('courses.pricingTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t(
              isLive
                ? 'courses.pricingSectionHintLive'
                : 'courses.pricingSectionHint'
            )}
          </p>
        </div>
        <Button
          type="button"
          onClick={openAdd}
          disabled={isSaving || allTypesTaken}
          title={allTypesTaken ? t('courses.allSellingWaysUsed') : undefined}
        >
          <Plus className="me-1 h-4 w-4" />
          {t('courses.addOffering')}
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {!isLive && (
            <SellingWayCard
              label={
                basePrice === 0
                  ? t('courses.offeringFREE')
                  : t('courses.offeringONE_TIME')
              }
              note={t('courses.offerFromCoursePrice')}
              price={basePrice}
              beforeDiscount={baseBeforeDiscount}
              isFree={basePrice === 0}
              termLabel={termLabel(null)}
              isActive={basePriceActive}
              lockReason={basePriceActive ? lockReason : undefined}
              removeDisabledReason={t('courses.basePriceNotRemovable')}
              onToggleActive={() =>
                form.setValue('base_price_active', !basePriceActive, {
                  shouldDirty: true
                })
              }
              onEdit={() => setBasePriceOpen(true)}
            />
          )}

          {extraOffers.map((offer) => (
            <SellingWayCard
              key={offer.id}
              label={offer.title ?? t(`courses.offering${offer.type}` as never)}
              price={offer.price}
              beforeDiscount={offer.compare_at_price}
              isFree={offer.type === 'FREE'}
              termLabel={termLabel(offer.access_duration_days)}
              recordedOnly={!offer.includes_live}
              isActive={offer.is_active}
              lockReason={offer.is_active ? lockReason : undefined}
              disabled={isSaving}
              onToggleActive={() => void toggleActive(offer)}
              onEdit={() => openEdit(offer)}
              onRemove={() => void remove(offer.id)}
            />
          ))}

          {isLive && (
            <LiveSeatCards
              courseId={courseId}
              offers={tutoringOffers}
              termLabel={termLabel}
            />
          )}

          {!isLive && (
            <TutoringWayCards offers={tutoringOffers} termLabel={termLabel} />
          )}
        </div>
      </CardContent>

      <BasePriceDialog
        open={basePriceOpen}
        onOpenChange={setBasePriceOpen}
        form={form}
      />
      <OfferDialog
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
        offer={editing}
        addableTypes={addableTypes}
        takenTypes={takenTypes}
        onSubmit={submitOffer}
      />
    </Card>
  );
}
