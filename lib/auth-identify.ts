import type { AccountIdentity } from '@/types/auth';

/**
 * The one rule that turns an identifier-first lookup into the next screen.
 * Shared by every login surface (panel, admin, academy site) so "unknown phone"
 * always means signup and never a password box the user cannot pass.
 *
 * Mirrored in edusphere — keep both copies semantically identical.
 */
export type IdentifyOutcome = 'register' | 'password' | 'otp' | 'blocked';

export function nextStepFor(identity: AccountIdentity): IdentifyOutcome {
  if (!identity.exists) return 'register';
  if (identity.can_use_password) return 'password';
  if (identity.can_use_otp) return 'otp';
  return 'blocked';
}
