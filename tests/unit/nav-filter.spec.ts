import { expect, test } from '@playwright/test';
import { navItems } from '@/constants/data';
import { filterNavItems, isPlatformMode } from '@/lib/nav-filter';
import type { NavItem } from '@/types';

const MANAGER = { role: 'MANAGER' as const, hasStore: true };
const PLATFORM_STAFF = { role: 'ADMIN' as const, hasStore: false };

function titles(items: NavItem[]): string[] {
  return items.map((item) => item.title);
}

/** Every item in the tree, parents included. */
function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
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
    const items = flatten(filterNavItems(navItems, MANAGER));
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
    expect(flatten(items).some((item) => item.adminOnly)).toBe(false);
  });

  test('a teacher sees fewer items than a manager', () => {
    const manager = flatten(filterNavItems(navItems, MANAGER));
    const teacher = flatten(
      filterNavItems(navItems, { role: 'TEACHER', hasStore: true })
    );
    expect(teacher.length).toBeLessThan(manager.length);
  });

  test('payment-gated items are hidden while payment is off', () => {
    // NEXT_PUBLIC_PAYMENT_ENABLED is unset in tests, so the gate is closed.
    const items = flatten(filterNavItems(navItems, MANAGER));
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
  test('a manager with no academy can only reach the academy-less pages', () => {
    const items = flatten(
      filterNavItems(navItems, { ...MANAGER, hasAcademy: false })
    );
    const enabled = items.filter((item) => !item.disabled);
    expect(enabled.map((item) => item.href).sort()).toEqual([
      '/academies',
      '/dashboard'
    ]);
  });

  test('a teacher with no academy can only reach the academy-less pages', () => {
    const items = flatten(
      filterNavItems(navItems, {
        role: 'TEACHER',
        hasStore: true,
        hasAcademy: false
      })
    );
    const enabled = items.filter((item) => !item.disabled);
    expect(enabled.map((item) => item.href).sort()).toEqual([
      '/academies',
      '/dashboard'
    ]);
  });

  test('no plan or billing route is live before the first academy', () => {
    const items = flatten(
      filterNavItems(navItems, { ...MANAGER, hasAcademy: false })
    );
    const plans = items.find((item) => item.title === 'Academy Subscription');
    expect(plans?.disabled ?? true).toBe(true);
  });

  test('platform staff are not gated on having an academy', () => {
    const items = filterNavItems(navItems, {
      ...PLATFORM_STAFF,
      hasAcademy: undefined
    });
    expect(items.length).toBeGreaterThan(1);
  });
});

test.describe('sidebar shape', () => {
  // The manager-facing sidebar is the product's front door: a long flat list is
  // the complexity we removed, so the top level stays scannable without scrolling.
  test('a manager gets a short top level', () => {
    // Worst case: every learning capability on, so nothing is filtered away.
    const items = filterNavItems(navItems, {
      ...MANAGER,
      learningVisibility: {
        students: true,
        assignments: true,
        ops_queue: true,
        tutoring: true
      }
    });
    expect(items.length).toBeLessThanOrEqual(8);
  });

  // The daily destinations must be one click away, not hidden in a group.
  test('the everyday screens sit at the top level', () => {
    const items = filterNavItems(navItems, MANAGER);
    for (const href of ['/dashboard', '/courses', '/users', '/website']) {
      expect(
        items.some((item) => item.href === href),
        href
      ).toBe(true);
    }
  });

  test('every group holds at least two children', () => {
    for (const options of [
      MANAGER,
      { role: 'TEACHER' as const, hasStore: true }
    ]) {
      for (const item of flatten(filterNavItems(navItems, options))) {
        if (!item.children) continue;
        expect(item.children.length, `group "${item.title}"`).toBeGreaterThan(
          1
        );
      }
    }
  });

  test('the nesting never goes deeper than one level', () => {
    for (const item of filterNavItems(navItems, MANAGER)) {
      for (const child of item.children ?? []) {
        expect(
          child.children,
          `${item.title} > ${child.title}`
        ).toBeUndefined();
      }
    }
  });

  test('no destination is offered twice', () => {
    const hrefs = flatten(filterNavItems(navItems, MANAGER))
      .map((item) => item.href)
      .filter((href): href is string => Boolean(href));
    expect(hrefs).toEqual(Array.from(new Set(hrefs)));
  });

  test('every leaf has a destination and every group has none', () => {
    for (const item of flatten(filterNavItems(navItems, MANAGER))) {
      if (item.children) expect(item.href, item.title).toBeUndefined();
      else expect(item.href, item.title).toBeTruthy();
    }
  });

  test('platform staff get a short top level too', () => {
    for (const options of [
      PLATFORM_STAFF,
      { role: 'PLATFORM_OWNER' as const, hasStore: false },
      { role: 'FINANCE' as const, hasStore: false },
      { role: 'SUPPORT' as const, hasStore: false }
    ]) {
      const items = filterNavItems(navItems, options);
      expect(items.length, options.role).toBeLessThanOrEqual(9);
    }
  });

  test('no section header is left behind now that groups replace them', () => {
    const items = flatten([
      ...filterNavItems(navItems, MANAGER),
      ...filterNavItems(navItems, PLATFORM_STAFF)
    ]);
    expect(items.some((item) => item.section)).toBe(false);
  });
});

test.describe('route scope honesty', () => {
  test("a manager's items never point at a platform route", () => {
    const items = flatten(filterNavItems(navItems, MANAGER));
    for (const item of items) {
      expect(
        item.href?.startsWith('/platform'),
        `${item.title} -> ${item.href}`
      ).toBeFalsy();
    }
  });

  test('roles management is reachable for a manager', () => {
    const items = flatten(filterNavItems(navItems, MANAGER));
    expect(titles(items)).toContain('Roles & Permissions');
    const roles = items.find((item) => item.title === 'Roles & Permissions');
    expect(roles?.href).toBe('/settings/roles');
  });
});
