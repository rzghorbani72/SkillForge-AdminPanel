import { expect, test } from '@playwright/test';
import { navItems } from '@/constants/data';
import { filterNavItems, isPlatformMode } from '@/lib/nav-filter';
import type { NavItem } from '@/types';

const MANAGER = { role: 'MANAGER' as const, hasStore: true };
const PLATFORM_STAFF = { role: 'ADMIN' as const, hasStore: false };

function titles(items: NavItem[]): string[] {
  return items.map((item) => item.title);
}

/** Section order as rendered, one entry per contiguous run of a section. */
function sectionRuns(items: NavItem[]): string[] {
  const runs: string[] = [];
  for (const item of items) {
    if (!item.section) continue;
    if (runs[runs.length - 1] !== item.section) runs.push(item.section);
  }
  return runs;
}

test.describe('isPlatformMode', () => {
  test('platform staff without an academy are in platform mode', () => {
    expect(isPlatformMode('ADMIN', false)).toBe(true);
    expect(isPlatformMode('PLATFORM_OWNER', false)).toBe(true);
  });

  test('platform staff scoped into an academy are not', () => {
    expect(isPlatformMode('ADMIN', true)).toBe(false);
  });

  test('academy roles are never in platform mode', () => {
    expect(isPlatformMode('MANAGER', false)).toBe(false);
    expect(isPlatformMode('TEACHER', false)).toBe(false);
    expect(isPlatformMode(null, false)).toBe(false);
  });
});

test.describe('nav scoping', () => {
  test('a manager is never shown a platform-scoped item', () => {
    const items = filterNavItems(navItems, MANAGER);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.scope).not.toBe('platform');
    }
  });

  test('platform mode hides every academy-scoped item', () => {
    const items = filterNavItems(navItems, PLATFORM_STAFF);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.scope).not.toBe('academy');
    }
  });

  test('a manager never gets an admin-only item', () => {
    const items = filterNavItems(navItems, MANAGER);
    expect(items.some((item) => item.adminOnly)).toBe(false);
  });

  test('a teacher sees fewer items than a manager', () => {
    const manager = filterNavItems(navItems, MANAGER);
    const teacher = filterNavItems(navItems, {
      role: 'TEACHER',
      hasStore: true
    });
    expect(teacher.length).toBeLessThan(manager.length);
  });

  test('payment-gated items are hidden while payment is off', () => {
    // NEXT_PUBLIC_PAYMENT_ENABLED is unset in tests, so the gate is closed.
    const items = filterNavItems(navItems, MANAGER);
    expect(items.some((item) => item.paymentGated)).toBe(false);
  });

  test('signed-out users only get items with no role restriction', () => {
    const items = filterNavItems(navItems, { role: null });
    for (const item of items) {
      expect(item.roles ?? []).toHaveLength(0);
    }
  });
});

test.describe('academy-less nav', () => {
  test('a manager with no academy only gets My Academies', () => {
    const items = filterNavItems(navItems, { ...MANAGER, hasAcademy: false });
    expect(items).toHaveLength(1);
    expect(items[0].href).toBe('/academies');
  });

  test('a teacher with no academy only gets My Academies', () => {
    const items = filterNavItems(navItems, {
      role: 'TEACHER',
      hasStore: true,
      hasAcademy: false
    });
    expect(items.map((item) => item.href)).toEqual(['/academies']);
  });

  test('no plan or billing route is offered before the first academy', () => {
    const items = filterNavItems(navItems, { ...MANAGER, hasAcademy: false });
    expect(titles(items)).not.toContain('Academy Subscription');
  });

  test('platform staff are not gated on having an academy', () => {
    const items = filterNavItems(navItems, {
      ...PLATFORM_STAFF,
      hasAcademy: undefined
    });
    expect(items.length).toBeGreaterThan(1);
  });
});

test.describe('section grouping', () => {
  // A section header renders once, at the first item carrying that section, so a
  // section split across the array silently files its later items under the
  // wrong header.
  test('each section appears as one contiguous run for a manager', () => {
    const runs = sectionRuns(filterNavItems(navItems, MANAGER));
    expect(runs).toEqual(Array.from(new Set(runs)));
  });

  test('each section appears as one contiguous run in platform mode', () => {
    const runs = sectionRuns(filterNavItems(navItems, PLATFORM_STAFF));
    expect(runs).toEqual(Array.from(new Set(runs)));
  });

  test('a manager gets a small, fixed set of sections', () => {
    const runs = sectionRuns(filterNavItems(navItems, MANAGER));
    expect(runs).toEqual(['learning', 'finance', 'growth', 'account']);
  });

  test('no section exists only to label a single row', () => {
    const items = filterNavItems(navItems, MANAGER);
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!item.section) continue;
      counts.set(item.section, (counts.get(item.section) ?? 0) + 1);
    }
    for (const [section, count] of Array.from(counts.entries())) {
      expect(
        count,
        `section "${section}" labels a single item`
      ).toBeGreaterThan(1);
    }
  });
});

test.describe('route scope honesty', () => {
  test("a manager's items never point at a platform route", () => {
    const items = filterNavItems(navItems, MANAGER);
    for (const item of items) {
      expect(
        item.href?.startsWith('/platform'),
        `${item.title} -> ${item.href}`
      ).toBeFalsy();
    }
  });

  test('roles management is reachable for a manager', () => {
    const items = filterNavItems(navItems, MANAGER);
    expect(titles(items)).toContain('Roles & Permissions');
    const roles = items.find((item) => item.title === 'Roles & Permissions');
    expect(roles?.href).toBe('/settings/roles');
  });
});
