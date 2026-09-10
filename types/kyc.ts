export const KYC_STATUS = {
  MISSING: 'MISSING',
  PARTIAL: 'PARTIAL',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

export type KycMissingField =
  | 'national_id'
  | 'birth_date'
  | 'card_front'
  | 'sheba';

export type KycState = {
  status: KycStatus;
  is_owner: boolean;
  can_edit: boolean;
  verification_enabled: boolean;
  shahkar_matched: boolean;
  iban_matched: boolean;
  verify_attempts_remaining: number;
  verify_locked_until: string | null;
  legal_entity_name: string | null;
  national_id: string | null;
  national_id_masked: string | null;
  birth_date: string | null;
  card_front_id: string | null;
  card_back_id: string | null;
  sheba_masked: string | null;
  sheba_status: string | null;
  contact_address: string | null;
  permit_declared_at: string | null;
  missing: readonly KycMissingField[];
  submitted_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  is_verified: boolean;
};

export type VerifyKycIdentityPayload = {
  legal_entity_name: string;
  national_id: string;
  birth_date: string;
};

export type VerifyKycShebaPayload = {
  sheba_number: string;
  account_holder_name: string;
};

export type SubmitKycPayload = {
  legal_entity_name: string;
  national_id: string;
  birth_date: string;
  card_front_id: string;
  card_back_id?: string;
  sheba_number: string;
  account_holder_name: string;
  contact_address?: string;
  permit_declared?: boolean;
};

export type KycCardUploadResult = {
  id: string;
};
