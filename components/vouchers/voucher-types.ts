export type DiscountType = 'PERCENT' | 'FIXED';
export type UsageType = 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';

export interface DiscountCode {
  id: number;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  academy_id?: string;
  usage_limit?: number;
  used_count: number;
  usage_type: UsageType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface VoucherFormData {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  usage_limit: number | undefined;
  usage_type: UsageType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_purchase_amount: number | undefined;
  max_discount_amount: number | undefined;
}

export const DEFAULT_VOUCHER_FORM: VoucherFormData = {
  code: '',
  description: '',
  discount_type: 'PERCENT',
  discount_value: 0,
  usage_limit: undefined,
  usage_type: 'UNLIMITED',
  start_date: '',
  end_date: '',
  is_active: true,
  min_purchase_amount: undefined,
  max_discount_amount: undefined
};
