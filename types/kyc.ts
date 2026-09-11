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

export type KycAttemptState = {
  attempts_remaining: number;
  locked_until: string | null;
};

export type KycIbanInfo = {
  name: string;
  bank_name: string;
  active: boolean;
};

export type KycState = {
  status: KycStatus;
  is_owner: boolean;
  can_edit: boolean;
  verification_enabled: boolean;
  shahkar_matched: boolean;
  iban_matched: boolean;
  iban_info_confirmed: boolean;
  settlement_eligible: boolean;
  max_verify_attempts: number;
  shahkar_attempts: KycAttemptState;
  iban_attempts: KycAttemptState;
  phone_number: string | null;
  legal_entity_name: string | null;
  national_id: string | null;
  birth_date: string | null;
  card_front_id: string | null;
  card_back_id: string | null;
  sheba_number: string | null;
  sheba_status: string | null;
  iban_info: KycIbanInfo | null;
  contact_address: string | null;
  permit_declared_at: string | null;
  missing: readonly KycMissingField[];
  submitted_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  is_verified: boolean;
};

export type VerifyKycIdentityPayload = {
  national_id: string;
};

export type VerifyKycShebaPayload = {
  birth_date: string;
  sheba_number: string;
};

export type SubmitKycPayload = {
  card_front_id: string;
  card_back_id?: string;
};

export type KycCardUploadResult = {
  id: string;
};
