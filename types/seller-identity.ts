export type SellerIdentityField =
  | 'legal_entity_name'
  | 'national_id'
  | 'contact_address'
  | 'permit_declared';

export type SellerIdentity = {
  legal_entity_name: string | null;
  national_id: string | null;
  economic_code: string | null;
  vat_registration_no: string | null;
  contact_address: string | null;
  permit_declared_at: string | null;
  is_complete: boolean;
  missing: readonly SellerIdentityField[];
};

export type UpdateSellerIdentityPayload = {
  legal_entity_name?: string;
  national_id?: string;
  economic_code?: string;
  vat_registration_no?: string;
  contact_address?: string;
  permit_declared?: boolean;
};
