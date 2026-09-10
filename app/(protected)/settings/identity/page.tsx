'use client';

import { redirect } from 'next/navigation';

/** KYC lives on the profile page now — keep old links working. */
export default function IdentityRedirectPage() {
  redirect('/settings/profile#kyc');
}
