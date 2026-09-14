import { call } from './api-call';

export type PaymentChannel = 'ONLINE' | 'WALLET' | 'BANK_TRANSFER' | 'CASH' | 'POS';

export type MoneyCustody = 'PLATFORM' | 'ACADEMY';

export type SettlementBlocker =
  | 'KYC_REQUIRED'
  | 'KYC_PENDING'
  | 'NO_BANK_ACCOUNT'
  | 'BANK_ACCOUNT_PENDING'
  | 'BANK_ACCOUNT_REJECTED'
  | 'NO_BALANCE'
  | 'BELOW_MINIMUM'
  | 'REQUEST_IN_PROGRESS'
  | 'COOLDOWN';

export type BankAccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface SettlementChannel {
  method: PaymentChannel;
  custody: MoneyCustody;
  gross: number;
  count: number;
}

export interface SettlementSummary {
  academy_id: string;
  channels: SettlementChannel[];
  totals: {
    collected_total: number;
    platform_held_gross: number;
    academy_collected_direct: number;
  };
  balance: {
    balance: number;
    pending: number;
    available: number;
    withdrawn_total: number;
  };
  bank_account: {
    status: BankAccountStatus;
    sheba_number: string;
    account_holder_name: string;
    review_note: string | null;
  } | null;
  min_amount: number;
  cooldown_days: number;
  next_request_at: string | null;
  can_request: boolean;
  blockers: SettlementBlocker[];
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  sheba_number: string | null;
  account_holder_name: string | null;
  bank_transaction_code: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

const base = '/financial/settlement';

export const settlementApi = {
  getSummary: (academyId: string) =>
    call<SettlementSummary>(`${base}/academies/${academyId}/summary`),

  getHistory: () => call<WithdrawalRecord[]>('/financial/withdrawals'),

  requestOtp: (academyId: string) =>
    call<{ data: { channel: 'phone' | 'email' } }>(
      `${base}/academies/${academyId}/bank-account/request-otp`,
      { method: 'POST' },
    ),

  submitBankAccount: (
    academyId: string,
    body: { sheba_number: string; account_holder_name: string; otp: string },
  ) =>
    call<unknown>(`${base}/academies/${academyId}/bank-account`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  requestSettlement: (academyId: string, body: { amount: number; notes?: string }) =>
    call<WithdrawalRecord>(`/financial/academies/${academyId}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
