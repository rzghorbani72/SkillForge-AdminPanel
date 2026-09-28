/** One academy the verified phone belongs to (`POST /auth/academies/lookup`). */
export interface MemberAcademy {
  id: string;
  name: string;
  slug: string;
  role: string;
  login_url: string;
}
