import { expect, test } from '@playwright/test';
import {
  hasPaidPlanEnrollment,
  needsPlanPurchase,
  overlayPaidEnrollment,
} from '@/lib/settings-scope';

test.describe('paid plan enrollment', () => {
  test('a PAID invoice counts even when the API still says unpaid', () => {
    expect(
      hasPaidPlanEnrollment({
        hasPaid: false,
        invoices: [{ status: 'PAID' }],
      }),
    ).toBe(true);
  });

  test('a true unpaid trial is not treated as enrolled', () => {
    expect(
      hasPaidPlanEnrollment({
        hasPaid: false,
        invoices: [{ status: 'TRIAL' }],
      }),
    ).toBe(false);
  });

  test('overlay marks a 100% coupon academy as paid and not on trial', () => {
    const overlaid = overlayPaidEnrollment({
      has_paid: false,
      is_trial: true,
      can_renew_now: true,
      days_remaining: 41,
      renewal_window_days: 7,
      period_months: null,
      invoices: [{ status: 'PAID', note: 'months=1; coupon=FULL_SUMMER' }],
    });
    expect(overlaid?.has_paid).toBe(true);
    expect(overlaid?.is_trial).toBe(false);
    expect(overlaid?.can_renew_now).toBe(false);
    expect(overlaid?.period_months).toBe(1);
  });

  test('needsPlanPurchase is false once the academy has enrolled', () => {
    expect(
      needsPlanPurchase({
        hasAcademy: true,
        planSlug: 'growth',
        status: 'ACTIVE',
        hasPaid: true,
      }),
    ).toBe(false);
  });
});
