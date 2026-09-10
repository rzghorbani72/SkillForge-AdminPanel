import { isApiResponseError } from './api-error';
import type { KycMissingField } from '@/types/kyc';

export const KYC_INCOMPLETE = 'KYC_INCOMPLETE';

/** Profile page path (no hash) — use for pathname checks. */
export const KYC_PROFILE_PATH = '/settings/profile';

/** Deep link into the identity section on the merged profile page. */
export const KYC_IDENTITY_PATH = `${KYC_PROFILE_PATH}#kyc`;

export type KycIncompleteError = Error & {
  code: typeof KYC_INCOMPLETE;
  missing: KycMissingField[];
};

const ALLOWED_MISSING = new Set<KycMissingField>([
  'national_id',
  'birth_date',
  'card_front',
  'sheba'
]);

function parseMissing(value: unknown): KycMissingField[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is KycMissingField =>
      typeof item === 'string' && ALLOWED_MISSING.has(item as KycMissingField)
  );
}

export function isKycIncompleteError(
  value: unknown
): value is KycIncompleteError {
  if (value instanceof Error && 'code' in value) {
    return (value as { code?: string }).code === KYC_INCOMPLETE;
  }
  return isApiResponseError(value) && value.error.code === KYC_INCOMPLETE;
}

export function missingFromKycError(value: unknown): KycMissingField[] {
  if (value instanceof Error && 'missing' in value) {
    return parseMissing((value as { missing?: unknown }).missing);
  }
  return [];
}

export function createKycIncompleteError(
  missing: KycMissingField[]
): KycIncompleteError {
  const error = new Error(KYC_INCOMPLETE) as KycIncompleteError;
  error.code = KYC_INCOMPLETE;
  error.missing = missing;
  return error;
}

export { parseMissing as parseKycMissingFields };
