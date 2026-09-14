import { isApiResponseError } from './api-error';
import type { SellerIdentityField } from '@/types/seller-identity';

export const SELLER_IDENTITY_INCOMPLETE = 'SELLER_IDENTITY_INCOMPLETE';

export type SellerIdentityIncompleteError = Error & {
  code: typeof SELLER_IDENTITY_INCOMPLETE;
  missing: SellerIdentityField[];
};

function parseMissing(value: unknown): SellerIdentityField[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<SellerIdentityField>([
    'legal_entity_name',
    'national_id',
    'contact_address',
    'permit_declared',
  ]);
  return value.filter(
    (item): item is SellerIdentityField =>
      typeof item === 'string' && allowed.has(item as SellerIdentityField),
  );
}

export function isSellerIdentityIncompleteError(
  value: unknown,
): value is SellerIdentityIncompleteError {
  if (value instanceof Error && 'code' in value) {
    return (value as { code?: string }).code === SELLER_IDENTITY_INCOMPLETE;
  }
  return isApiResponseError(value) && value.error.code === SELLER_IDENTITY_INCOMPLETE;
}

export function missingFromSellerIdentityError(value: unknown): SellerIdentityField[] {
  if (value instanceof Error && 'missing' in value) {
    return parseMissing((value as { missing?: unknown }).missing);
  }
  return [];
}

export function createSellerIdentityIncompleteError(
  missing: SellerIdentityField[],
): SellerIdentityIncompleteError {
  const error = new Error(SELLER_IDENTITY_INCOMPLETE) as SellerIdentityIncompleteError;
  error.code = SELLER_IDENTITY_INCOMPLETE;
  error.missing = missing;
  return error;
}
