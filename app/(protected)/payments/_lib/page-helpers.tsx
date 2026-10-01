import { toPersianDigits } from '@/lib/phone-utils';

export const STATUS_BADGES: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-muted text-foreground',
};

export function paymentStatusLabel(status: string | undefined, t: (key: string) => string): string {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return t('financial.store.overview.statusPaid');
    case 'PENDING':
      return t('financial.store.overview.statusPending');
    case 'FAILED':
      return t('financial.store.overview.statusFailed');
    case 'REFUNDED':
      return t('financial.store.overview.statusRefunded');
    case 'CANCELLED':
      return t('payments.cancelled');
    default:
      return status ?? '—';
  }
}

export function formatDisplayUuid(uuid: string | undefined, language: string): string {
  if (!uuid) return '—';
  return language === 'fa' ? toPersianDigits(uuid) : uuid;
}

export type PaymentNotes = {
  s?: string;
  p?: string;
  m?: string;
  a?: number;
  pf?: number;
  tp?: number;
  sn?: number;
};
