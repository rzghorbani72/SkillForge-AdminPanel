/** Prefer paid_at (API), then legacy payment_date, then created_at. */
export function paymentDateOf(payment: {
  paid_at?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
}): string | null {
  return payment.paid_at ?? payment.payment_date ?? payment.created_at ?? null;
}

export function isPaidPayment(status?: string | null): boolean {
  return status === 'PAID';
}
