import { toast } from 'react-toastify';
import { useTranslation } from '@/lib/i18n/hooks';
import { homeRouteFor, resolveSessionRole } from '@/lib/auth-routing';
import type { Dispatch, SetStateAction } from 'react';
import type { PendingRedirect } from '@/hooks/use-delayed-redirect';
import type { LoginResponse } from '../_lib/use-login-helpers';
import type { useAcademySelect } from './use-academy-select';

type FinishLoginParams = {
  scheduleRedirect: Dispatch<SetStateAction<PendingRedirect | null>>;
  planQuery: string;
  academy: ReturnType<typeof useAcademySelect>;
  beforeAcademyPicker: () => void;
};

/**
 * Shared "what to do with a login response" — used after a password login and
 * after the OTP/reset gates, so every path lands the user the same way
 * (single academy, academy picker, or straight in).
 */
export function useFinishLogin({
  scheduleRedirect,
  planQuery,
  academy,
  beforeAcademyPicker,
}: FinishLoginParams) {
  const { t } = useTranslation();

  // A role we cannot place is a failed login (no panel seat) — /unauthorized
  // is reserved for banned/deactivated staff.
  function schedulePostLoginRedirect(response: LoginResponse) {
    const href = homeRouteFor(resolveSessionRole(response), { planQuery });
    if (!href) {
      toast.error(t('error.authenticationFailed'), { toastId: 'login-error' });
      return;
    }

    scheduleRedirect({
      href,
      title: t('success.loginSuccess'),
      message: href.startsWith('/dashboard')
        ? t('auth.redirectingToAffiliate')
        : t('auth.redirectingToDashboard'),
    });
  }

  return async function finishLogin(response: LoginResponse) {
    const academies = response.availableAcademies || response.available_academies || [];

    if (academies.length === 1) {
      await academy.handleAcademySelect(academies[0].id);
      return;
    }

    if (response.requires_academy_selection || academies.length > 0) {
      beforeAcademyPicker();
      academy.showAcademyPicker(academies);
      return;
    }

    toast.success(t('success.loginSuccess'), { toastId: 'login-success' });
    schedulePostLoginRedirect(response);
  };
}
