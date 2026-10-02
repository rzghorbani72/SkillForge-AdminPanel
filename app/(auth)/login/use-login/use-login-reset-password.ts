import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPanelAccessBlockedError } from '@/lib/auth-login-errors';
import { apiErrorMessage } from '@/lib/api-error-message';
import { LoginResponse, goToUnauthorized } from '../_lib/use-login-helpers';

export function useLoginResetPassword(finishLogin: (response: LoginResponse) => Promise<void>) {
  const { t } = useTranslation();
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [resetTempToken, setResetTempToken] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleSetNewPasswordSubmit(newPassword: string) {
    setResetLoading(true);
    setResetError('');
    try {
      const response = (await apiClient.setNewPassword(
        resetTempToken,
        newPassword,
      )) as LoginResponse;
      setPasswordResetRequired(false);
      await finishLogin(response);
    } catch (error: unknown) {
      if (isPanelAccessBlockedError(error)) {
        goToUnauthorized();
        return;
      }
      setResetError(apiErrorMessage(error, t('error.authenticationFailed')));
    } finally {
      setResetLoading(false);
    }
  }

  return {
    handleSetNewPasswordSubmit,
    passwordResetRequired,
    resetError,
    resetLoading,
    setPasswordResetRequired,
    setResetTempToken,
  };
}
