import { toast } from 'react-toastify';
import { currentLanguage } from '../current-language';
import { logger } from '@/lib/logging/app-logger';
import { STORM_WINDOW_MS } from '../request-storm-guard';
import { t } from '../i18n';
import { LEGAL_CONSENT_REQUIRED_EVENT, SUBSCRIPTION_REQUIRED_EVENT } from './helpers';
import type {
  ApiPauseReason,
  LegalConsentRequiredDetail,
  SubscriptionRequiredDetail,
} from './types-1';

export class RequestGate {
  /** Blocks new fetches after the first auth/consent failure to avoid throttle storms. */
  protected pauseReason: ApiPauseReason | null = null;

  /** Ensures the expired-subscription warning is dispatched once, not per blocked write. */
  protected subscriptionRequiredNotified = false;

  getPauseReason(): ApiPauseReason | null {
    return this.pauseReason;
  }

  /**
   * A lapsed academy keeps read-only GET access; only writes get a 402. We surface
   * that as a dismissible warning + Upgrade CTA (see SubscriptionRequiredGate) instead
   * of throwing, which would freeze the panel with a dev error overlay.
   */
  protected notifySubscriptionRequired(message: string): void {
    if (typeof window === 'undefined' || this.subscriptionRequiredNotified) return;
    this.subscriptionRequiredNotified = true;
    window.dispatchEvent(
      new CustomEvent<SubscriptionRequiredDetail>(SUBSCRIPTION_REQUIRED_EVENT, {
        detail: { message },
      }),
    );
  }

  /** Let the gate re-arm the warning after the manager dismisses it. */
  clearSubscriptionRequired(): void {
    this.subscriptionRequiredNotified = false;
  }

  /** Clear the pause gate after legal accept (or a full page navigation). */
  resumeRequests(): void {
    this.pauseReason = null;
  }

  /**
   * Pause non-allowlisted calls when pending legal docs are known
   * (from status check or a 403 LEGAL_CONSENT_REQUIRED response).
   */
  pauseForLegalConsent(pending: LegalConsentRequiredDetail['pending'] = []): void {
    this.enterPause('legal', pending);
  }

  protected enterPause(
    reason: ApiPauseReason,
    pending?: LegalConsentRequiredDetail['pending'],
  ): void {
    // First pause wins. Allow legal→legal so we can refresh the pending payload/event.
    if (this.pauseReason !== null && !(this.pauseReason === 'legal' && reason === 'legal')) {
      return;
    }
    this.pauseReason = reason;
    if (
      reason === 'legal' &&
      typeof window !== 'undefined' &&
      Array.isArray(pending) &&
      pending.length > 0
    ) {
      window.dispatchEvent(
        new CustomEvent<LegalConsentRequiredDetail>(LEGAL_CONSENT_REQUIRED_EVENT, {
          detail: { pending },
        }),
      );
    }
  }

  protected isAllowedDuringPause(endpoint: string): boolean {
    if (this.isAuthFlowEndpoint(endpoint)) return true;
    // Session bootstrap + legal accept/status must work while paused
    if (endpoint.includes('/auth/me')) return true;
    if (endpoint.includes('/legal/acceptances')) return true;
    return false;
  }

  protected throwIfPaused(endpoint: string): void {
    if (!this.pauseReason || this.isAllowedDuringPause(endpoint)) return;

    if (this.pauseReason === 'legal') {
      const error = new Error('LEGAL_CONSENT_REQUIRED') as Error & {
        code: string;
      };
      error.code = 'LEGAL_CONSENT_REQUIRED';
      throw error;
    }

    throw new Error('Session expired. API calls paused.');
  }

  /**
   * One route hammered far above human speed means a render loop, a runaway
   * retry, or a hostile script. Client state is no longer trusted: on a
   * session-carrying route we sign out and wipe storage; auth-flow routes
   * are just blocked until the window cools down.
   */
  protected handleRequestStorm(endpoint: string, method: string, count: number): never {
    const isProtected = !this.isAuthFlowEndpoint(endpoint);
    logger.error('RequestStorm', 'Tripped', {
      route: endpoint.split('?')[0] ?? endpoint,
      method,
      count,
      window_ms: STORM_WINDOW_MS,
      is_protected: isProtected,
    });

    if (isProtected && this.pauseReason === null) {
      this.enterPause('session');
      if (typeof window !== 'undefined') {
        toast.error(t('error.requestStorm', currentLanguage()));
        void import('../sign-out').then(({ signOut }) => signOut());
      }
    }

    throw new Error('Request storm detected. API calls paused.');
  }

  protected isAuthFlowEndpoint(endpoint: string): boolean {
    return (
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/public/login') ||
      endpoint.includes('/auth/public/identify') ||
      endpoint.includes('/auth/staff/identify') ||
      endpoint.includes('/auth/staff/login') ||
      endpoint.includes('/auth/admin/login') ||
      endpoint.includes('/auth/forget-password') ||
      endpoint.includes('/auth/admin/forget-password') ||
      endpoint.includes('/auth/login-by-phone-otp') ||
      endpoint.includes('/auth/login-by-email-otp') ||
      endpoint.includes('/auth/register') ||
      endpoint.includes('/auth/otp/') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/auth/logout') ||
      endpoint.includes('/auth/confirm-phone') ||
      endpoint.includes('/auth/set-new-password') ||
      endpoint.includes('/auth/select-academy') ||
      endpoint.includes('/auth/switch-academy') ||
      endpoint.includes('/auth/panel-handoff') ||
      endpoint.includes('/auth/academies/lookup') ||
      endpoint.includes('/auth/csrf')
    );
  }
}
