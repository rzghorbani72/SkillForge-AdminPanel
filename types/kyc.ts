export const KYC_STATUS = {
  MISSING: 'MISSING',
  PARTIAL: 'PARTIAL',
  VERIFIED: 'VERIFIED',
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

export type KycMissingField = 'national_id' | 'birth_date' | 'sheba';

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
  can_change_iban: boolean;
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
  sheba_number: string | null;
  sheba_status: string | null;
  iban_info: KycIbanInfo | null;
  pending_sheba_number: string | null;
  pending_iban_info: KycIbanInfo | null;
  contact_address: string | null;
  permit_declared_at: string | null;
  missing: readonly KycMissingField[];
  is_verified: boolean;
};

export type VerifyKycIdentityPayload = {
  national_id: string;
};

export type VerifyKycShebaPayload = {
  birth_date: string;
  sheba_number: string;
};

export type VerifiedIban = {
  sheba_number: string;
  account_holder_name: string;
  bank_name: string | null;
  academy_names: string[];
  is_current: boolean;
};
