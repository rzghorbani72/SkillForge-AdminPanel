import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { LoginResponse } from '../_lib/use-login-helpers';
import { PendingRedirect } from '@/hooks/use-delayed-redirect';
import { useLoginResetPassword } from './use-login-reset-password';
import { useLoginOtpResend } from './use-login-otp-resend';
import { useLoginOtpSubmit } from './use-login-otp-submit';

export function useLoginOtp({
  finishLogin,
  scheduleRedirect,
  setRegistrationRequired,
}: {
  finishLogin: (response: LoginResponse) => Promise<void>;
  scheduleRedirect: Dispatch<SetStateAction<PendingRedirect | null>>;
  setRegistrationRequired: Dispatch<SetStateAction<boolean>>;
}) {
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpMode, setOtpMode] = useState<'verify' | 'login'>('verify');
  const [otpTempToken, setOtpTempToken] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpFullPhone, setOtpFullPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const reset = useLoginResetPassword(finishLogin);
  const phone = otpFullPhone || otpPhone;

  const handleOtpSubmit = useLoginOtpSubmit({
    otp,
    mode: otpMode,
    phone,
    tempToken: otpTempToken,
    finishLogin,
    scheduleRedirect,
    setRegistrationRequired,
    setLoading: setOtpLoading,
    setError: setOtpError,
    onPasswordResetRequired: (tempToken) => {
      setOtpRequired(false);
      reset.setResetTempToken(tempToken);
      reset.setPasswordResetRequired(true);
    },
  });
  const resendOtp = useLoginOtpResend({
    phone,
    mode: otpMode,
    setLoading: setOtpLoading,
    setError: setOtpError,
    setRegistrationRequired,
  });

  return {
    ...reset,
    handleOtpSubmit,
    otp,
    otpError,
    otpLoading,
    otpPhone,
    otpRequired,
    resendOtp,
    setOtp,
    setOtpError,
    setOtpFullPhone,
    setOtpMode,
    setOtpPhone,
    setOtpRequired,
    setOtpTempToken,
    resetOtp: () => {
      setOtpRequired(false);
      setOtpMode('verify');
      setOtp('');
      setOtpError('');
      setRegistrationRequired(false);
    },
  };
}
