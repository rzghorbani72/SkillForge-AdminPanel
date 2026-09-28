import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error-message';
import { notifyOtpSent } from '@/lib/otp-notify';
import { useTranslation } from '@/lib/i18n/hooks';
import type { MemberAcademy } from '@/types/auth';

export type MemberAcademiesStep = 'intro' | 'otp' | 'list';

/**
 * "You have an account, just not here." A phone that belongs to an academy but
 * has no panel role (a student the manager added) gets its academy list here.
 *
 * The list is behind a one-time code because membership is private: without it,
 * typing any phone number would reveal where that person studies.
 */
export function useMemberAcademies(phoneE164: string) {
  const { t } = useTranslation();
  const [step, setStep] = useState<MemberAcademiesStep>('intro');
  const [otp, setOtp] = useState('');
  const [academies, setAcademies] = useState<MemberAcademy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendCode(captchaToken: string) {
    setLoading(true);
    setError('');
    try {
      await apiClient.sendAcademyLookupOtp(phoneE164, captchaToken);
      setStep('otp');
      notifyOtpSent(t('success.otpSent'), 'academy-lookup-otp');
    } catch (err: unknown) {
      setError(apiErrorMessage(err, t('error.authenticationFailed')));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.lookupMyAcademies(phoneE164, otp.trim());
      setAcademies(data);
      setStep('list');
    } catch (err: unknown) {
      setError(apiErrorMessage(err, t('error.authenticationFailed')));
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    otp,
    setOtp,
    academies,
    loading,
    error,
    sendCode,
    verifyCode,
    backToIntro: () => {
      setStep('intro');
      setOtp('');
      setError('');
    },
  };
}
