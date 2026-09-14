const DAY_MS = 24 * 60 * 60 * 1000;

export type SubscriptionUiStatus = 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'INACTIVE' | string | undefined;

export function computeSubscriptionDaysRemaining(input: {
  subscriptionExpires: string | null | undefined;
  graceUntil: string | null | undefined;
  status: SubscriptionUiStatus;
  now?: Date;
}): number | null {
  const now = input.now ?? new Date();

  if (input.status === 'INACTIVE' || !input.subscriptionExpires) {
    return null;
  }

  if (input.status === 'EXPIRED') {
    return 0;
  }

  if (input.status === 'GRACE') {
    if (!input.graceUntil) return 0;
    const deadline = new Date(input.graceUntil);
    if (Number.isNaN(deadline.getTime())) return 0;
    return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS));
  }

  const expires = new Date(input.subscriptionExpires);
  if (Number.isNaN(expires.getTime())) return null;
  return Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / DAY_MS));
}

export function subscriptionNeedsLiveRefresh(input: {
  isTrial?: boolean;
  status?: SubscriptionUiStatus;
  daysRemaining?: number | null;
}): boolean {
  if (input.isTrial || input.status === 'GRACE') return true;
  return input.daysRemaining != null && input.daysRemaining <= 14;
}
