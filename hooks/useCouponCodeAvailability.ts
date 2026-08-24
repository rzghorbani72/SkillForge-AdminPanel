'use client';

import { useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { normalizeDiscountCode } from '@/lib/coupons';

type UseCouponCodeAvailabilityParams = {
  enabled: boolean;
  code: string;
  startDate: string;
  endDate: string;
  academyId?: string;
  excludeId?: string;
  takenMessage: string;
  onAvailable: () => void;
  onTaken: (message: string) => void;
};

export function useCouponCodeAvailability({
  enabled,
  code,
  startDate,
  endDate,
  academyId,
  excludeId,
  takenMessage,
  onAvailable,
  onTaken
}: UseCouponCodeAvailabilityParams) {
  useEffect(() => {
    if (!enabled) {
      onAvailable();
      return;
    }

    const normalized = normalizeDiscountCode(code);
    if (normalized.length < 3 || !startDate || !endDate) {
      onAvailable();
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await apiClient.checkDiscountCodeAvailability({
          code: normalized,
          start_date: startDate,
          end_date: endDate,
          academy_id: academyId?.trim() || undefined,
          exclude_id: excludeId
        });

        if (cancelled) return;

        if (result.available) {
          onAvailable();
        } else {
          onTaken(takenMessage);
        }
      } catch {
        if (!cancelled) onAvailable();
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    enabled,
    code,
    startDate,
    endDate,
    academyId,
    excludeId,
    takenMessage,
    onAvailable,
    onTaken
  ]);
}
