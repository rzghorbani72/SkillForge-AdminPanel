/** Carries what the user already typed into signup, so step 1 is never retyped. */
export function buildRegisterHref(
  phone: string,
  planParam: string | null,
  periodParam: string | null,
): string {
  const params = new URLSearchParams();
  if (phone.trim()) params.set('phone', phone.trim());
  if (planParam) params.set('plan', planParam);
  if (periodParam === 'monthly' || periodParam === 'quarterly') {
    params.set('period', periodParam);
  }
  const query = params.toString();
  return query ? `/register?${query}` : '/register';
}
