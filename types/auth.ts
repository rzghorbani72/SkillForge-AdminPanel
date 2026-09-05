/** Answer of the identifier-first login lookup (`POST /auth/staff/identify`). */
export interface AccountIdentity {
  exists: boolean;
  channel: 'phone' | 'email';
  can_use_password: boolean;
  can_use_otp: boolean;
  captcha_required: boolean;
  /**
   * No panel account, but the person is a member of at least one academy —
   * a student added by a manager. Which academy stays hidden until they verify
   * the phone with a one-time code (`GET`ting it needs `MemberAcademy` below).
   */
  member_elsewhere?: boolean;
  /**
   * This identifier belongs to a banned or deactivated panel account.
   * The login screen sends them to `/unauthorized`.
   */
  panel_blocked?: boolean;
}

/** One academy the verified phone belongs to (`POST /auth/academies/lookup`). */
export interface MemberAcademy {
  id: string;
  name: string;
  slug: string;
  role: string;
  login_url: string;
}
