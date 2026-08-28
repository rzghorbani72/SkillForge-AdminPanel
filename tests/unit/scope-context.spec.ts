import { expect, test } from '@playwright/test';
import { isPlatformScoped } from '@/components/shared/scope-context-banner';

/**
 * The banner tells a tenant admin they have left their own academy's data. A
 * false positive teaches them to ignore it, so the exact path set matters.
 */
test.describe('page scope', () => {
  test('platform-wide routes are flagged', () => {
    expect(isPlatformScoped('/platform')).toBe(true);
    expect(isPlatformScoped('/platform/users')).toBe(true);
    expect(isPlatformScoped('/platform/roles')).toBe(true);
    expect(isPlatformScoped('/withdrawals')).toBe(true);
    expect(isPlatformScoped('/financial/platform')).toBe(true);
  });

  test('academy routes are not flagged', () => {
    expect(isPlatformScoped('/dashboard')).toBe(false);
    expect(isPlatformScoped('/courses')).toBe(false);
    expect(isPlatformScoped('/users')).toBe(false);
    expect(isPlatformScoped('/website')).toBe(false);
    expect(isPlatformScoped('/financial')).toBe(false);
  });

  test('the academy roles page is not flagged as platform-wide', () => {
    expect(isPlatformScoped('/settings/roles')).toBe(false);
  });

  test('a prefix only matches on a path boundary', () => {
    // "/academies" must not swallow "/academies-something-else".
    expect(isPlatformScoped('/academies')).toBe(true);
    expect(isPlatformScoped('/academies/abc')).toBe(true);
    expect(isPlatformScoped('/academies-report')).toBe(false);
    expect(isPlatformScoped('/platform-tools')).toBe(false);
  });
});
