type TranslateFn = (key: string) => string;

/**
 * Maps PaymentMethod / PaymentProvider enum values to localized labels.
 * Falls back to "unknown" when empty; unknown codes use English pack via i18n fallback.
 */
export function formatPaymentMethodLabel(
  raw: string | null | undefined,
  t: TranslateFn
): string {
  const normalized = raw?.trim().toUpperCase().replace(/\s+/g, '_');
  if (!normalized || normalized === 'UNKNOWN') {
    return t('payments.unknownMethod');
  }

  const key = `payments.methodLabels.${normalized}`;
  const label = t(key);
  if (label !== key) {
    return label;
  }

  return t('payments.unknownMethod');
}
