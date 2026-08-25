'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin } from '@/lib/roles';
import type { CouponSummary } from '@/lib/coupons';

/**
 * Platform plan vouchers the current manager can redeem on plan pay/upgrade.
 * Skips the fetch for platform admins (they mint codes, they don't redeem).
 */
export function useRedeemablePlanVouchers() {
  const { user } = useAuthUser();
  const canRedeem = !!user && user.role === 'MANAGER' && !isPlatformAdmin(user);

  const [vouchers, setVouchers] = useState<CouponSummary[]>([]);
  const [loading, setLoading] = useState(canRedeem);

  useEffect(() => {
    if (!canRedeem) {
      setVouchers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await apiClient.getRedeemablePlanVouchers();
        if (!cancelled) setVouchers(data?.vouchers ?? []);
      } catch {
        if (!cancelled) setVouchers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [canRedeem]);

  return { vouchers, loading, canRedeem };
}
