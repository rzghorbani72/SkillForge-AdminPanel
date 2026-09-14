'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { TutoringOffer } from '@/types/learning-operations';

export interface OfferFormState {
  course_id: string;
  tutor_profile_id: string;
  title: string;
  price: string;
  duration_days: string;
  sessions_included: string;
}

const EMPTY_FORM: OfferFormState = {
  course_id: '',
  tutor_profile_id: '',
  title: '',
  price: '',
  duration_days: '',
  sessions_included: '',
};

export function useTutoringOffers() {
  const [offers, setOffers] = useState<TutoringOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OfferFormState>(EMPTY_FORM);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      setOffers(await apiClient.getTutoringOffers());
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const createOffer = useCallback(async () => {
    if (!form.course_id || !form.tutor_profile_id || !form.title) return;
    setSaving(true);
    try {
      await apiClient.createTutoringOffer({
        course_id: form.course_id,
        tutor_profile_id: form.tutor_profile_id,
        title: form.title,
        price: form.price ? Number(form.price) : undefined,
        duration_days: form.duration_days ? Number(form.duration_days) : undefined,
        sessions_included: form.sessions_included ? Number(form.sessions_included) : undefined,
      });
      setForm(EMPTY_FORM);
      await loadOffers();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  }, [form, loadOffers]);

  const toggleActive = useCallback(
    async (offer: TutoringOffer) => {
      setSaving(true);
      try {
        await apiClient.updateTutoringOffer(offer.id, {
          is_active: !offer.is_active,
        });
        await loadOffers();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setSaving(false);
      }
    },
    [loadOffers],
  );

  return { offers, loading, saving, form, setForm, createOffer, toggleActive };
}
