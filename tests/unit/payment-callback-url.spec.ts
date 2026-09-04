import { expect, test } from '@playwright/test';
import {
  paymentGatewayCallbackUrl,
  paymentResultUrl,
  panelPublicOrigin
} from '@/lib/payment-callback-url';

test.describe('panel payment callback URLs', () => {
  test('points BitPay at the public Mentoma panel, not a loopback origin', () => {
    expect(panelPublicOrigin()).toMatch(/mentoma\.ir$/);
    expect(paymentGatewayCallbackUrl('BITPAY')).toBe(
      `${panelPublicOrigin()}/payment/bitpay-callback`
    );
    expect(paymentResultUrl({ success: 'true', refid: '1' })).toContain(
      '/payment/callback'
    );
    expect(paymentGatewayCallbackUrl('BITPAY')).not.toContain('0.0.0.0');
    expect(paymentGatewayCallbackUrl('BITPAY')).not.toContain('localhost');
  });
});
