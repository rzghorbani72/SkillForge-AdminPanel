/** Answer of the identifier-first login lookup (`POST /auth/staff/identify`). */
export interface AccountIdentity {
  exists: boolean;
  channel: 'phone' | 'email';
  can_use_password: boolean;
  can_use_otp: boolean;
  captcha_required: boolean;
}
