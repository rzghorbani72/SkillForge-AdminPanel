'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { SubscriptionPlanData } from '@/components/plans/plan-types';
import { Academy } from '@/types/api';

export function useContactSales({
  currentPlan,
  currentSub,
  selectedAcademy,
}: {
  currentPlan: SubscriptionPlanData | null | undefined;
  currentSub: any;
  selectedAcademy: Academy | null;
}) {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [contactMessage, setContactMessage] = useState('');

  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  async function handleSubmitContactSales() {
    try {
      setIsSubmittingContact(true);
      // Sales needs to know who is asking and what they run today, or the
      // first call is spent collecting facts the panel already has.
      const context = [
        t('plans.enterpriseContactAcademy', {
          name: selectedAcademy?.name ?? '—',
        }),
        t('plans.enterpriseContactCurrentPlan', {
          plan:
            currentSub?.academy?.custom_plan?.name ??
            currentPlan?.name ??
            t('subscriptionStatus.inactive'),
          term: t(currentSub?.period_months === 3 ? 'plans.termQuarterly' : 'plans.termMonthly'),
        }),
      ].join('\n');
      await apiClient.createPlatformTicket({
        // SALES routes it to the sales queue; BILLING would bury a new deal in
        // the invoice pile.
        subject: t('plans.enterpriseContactSubject'),
        category: 'SALES',
        priority: 'HIGH',
        body: `${contactMessage.trim() || t('plans.enterpriseContactSubject')}\n\n${context}`,
      });
      toast.success(t('plans.enterpriseContactSuccess'));
      setIsContactOpen(false);
      setContactMessage('');
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSubmittingContact(false);
    }
  }

  return {
    contactMessage,
    handleSubmitContactSales,
    isContactOpen,
    isSubmittingContact,
    setContactMessage,
    setIsContactOpen,
  };
}
