'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  computeSubscriptionDaysRemaining,
  type SubscriptionUiStatus,
} from '@/lib/subscription-days';

const TICK_MS = 60_000;

export function useLiveSubscriptionDays(input: {
  subscriptionExpires: string | null | undefined;
  graceUntil: string | null | undefined;
  status: SubscriptionUiStatus;
}): number | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(
    () =>
      computeSubscriptionDaysRemaining({
        subscriptionExpires: input.subscriptionExpires,
        graceUntil: input.graceUntil,
        status: input.status,
        now,
      }),
    [input.subscriptionExpires, input.graceUntil, input.status, now],
  );
}
