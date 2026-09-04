import { API_PRODUCTION_DEFAULTS } from '@/lib/api-config';
import type { PaymentGatewayProvider } from '@/types/api';

/** Where each gateway sends the manager back after payment. No query string. */
export const GATEWAY_CALLBACK_PATHS: Record<PaymentGatewayProvider, string> = {
  BITPAY: '/payment/bitpay-callback',
  SAMAN_SEP: '/payment/saman-callback',
  MELLAT_BP: '/payment/mellat-callback'
};

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1)$/i;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

/**
 * Public panel origin for PSP redirects. BitPay (and Shaparak) must receive a
 * registered HTTPS host — never the tab's 0.0.0.0 / localhost origin.
 */
export function panelPublicOrigin(): string {
  const raw = stripTrailingSlash(
    process.env.NEXT_PUBLIC_HOST || API_PRODUCTION_DEFAULTS.panelHost
  );
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (LOOPBACK_HOST.test(url.hostname)) {
      return API_PRODUCTION_DEFAULTS.panelHost;
    }
    return url.origin;
  } catch {
    return API_PRODUCTION_DEFAULTS.panelHost;
  }
}

export function paymentGatewayCallbackUrl(
  provider: PaymentGatewayProvider
): string {
  return `${panelPublicOrigin()}${GATEWAY_CALLBACK_PATHS[provider]}`;
}

/** Success/failure page after the gateway-specific verify route finishes. */
export function paymentResultUrl(
  params: Record<string, string | undefined>
): string {
  const url = new URL('/payment/callback', `${panelPublicOrigin()}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}
