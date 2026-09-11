import type { NavItem } from '@/types';

const WITHDRAWALS_HREF = '/withdrawals';

/**
 * Puts the pending-settlement count on the withdrawals item and its parent
 * group, so staff see it even while the group is collapsed. Pure: returns new
 * items, never mutates the nav config.
 */
export function withPendingSettlementBadge(
  items: NavItem[],
  count: number
): NavItem[] {
  if (count <= 0) return items;
  return items.map((item) => {
    if (item.href === WITHDRAWALS_HREF) return { ...item, badge: count };
    if (!item.children?.some((child) => child.href === WITHDRAWALS_HREF)) {
      return item;
    }
    return {
      ...item,
      badge: count,
      children: item.children.map((child) =>
        child.href === WITHDRAWALS_HREF ? { ...child, badge: count } : child
      )
    };
  });
}
