import { expect, test } from '@playwright/test';
import { isPlatformCookieName, isPlatformStorageKey } from '@/lib/wipe-non-platform-storage';

test.describe('platform storage keep-list', () => {
  test('keeps language, theme, and sidebar chrome', () => {
    expect(isPlatformStorageKey('preferred_language')).toBe(true);
    expect(isPlatformStorageKey('theme')).toBe(true);
    expect(isPlatformStorageKey('sidebar-minimized')).toBe(true);
  });

  test('drops academy, person, and staff keys', () => {
    expect(isPlatformStorageKey('skillforge_selected_academy_id')).toBe(false);
    expect(isPlatformStorageKey('skillforge_academies_cache')).toBe(false);
    expect(isPlatformStorageKey('categories-store')).toBe(false);
    expect(isPlatformStorageKey('user_country')).toBe(false);
    expect(isPlatformStorageKey('preview_real_data')).toBe(false);
    expect(isPlatformStorageKey('mentoma-setup-checklist:abc')).toBe(false);
    expect(isPlatformStorageKey('user_data')).toBe(false);
  });

  test('keeps language and consent cookies', () => {
    expect(isPlatformCookieName('preferred_language')).toBe(true);
    expect(isPlatformCookieName('gdpr_consent')).toBe(true);
    expect(isPlatformCookieName('jwt')).toBe(false);
    expect(isPlatformCookieName('skillforge_selected_academy_id')).toBe(false);
  });
});
