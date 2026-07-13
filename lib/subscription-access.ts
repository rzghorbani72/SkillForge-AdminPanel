type SubscriptionManageableUser =
  | {
      role?: string;
      isAdminProfile?: boolean;
      platformLevel?: boolean;
    }
  | null
  | undefined;

/**
 * Only the academy manager (or an academy-scoped ADMIN, not a platform admin)
 * may view or change the academy subscription.
 */
export function canManageSubscription(
  user: SubscriptionManageableUser
): boolean {
  if (!user) return false;
  return (
    user.role === 'MANAGER' ||
    (user.role === 'ADMIN' && !user.isAdminProfile && !user.platformLevel)
  );
}
