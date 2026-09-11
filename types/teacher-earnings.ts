export interface TeacherBalance {
  profile_id: string;
  total_earned: number;
  payment_count: number;
  total_paid_out: number;
  available_balance: number;
}

export interface TeacherPayoutRecord {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  tracking_code: string | null;
  bank_response: string | null;
  teacher_confirmed_at: string | null;
  teacher_rejected_at: string | null;
  notes: string | null;
  processed_at: string | null;
  requested_at: string;
  Profile: { id: string; display_name: string | null };
}
