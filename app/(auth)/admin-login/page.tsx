'use client';

import { useAdminLogin } from './use-admin-login';
import { AdminLoginForm } from './_components/admin-login-form';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';

export default function AdminLoginPage() {
  const login = useAdminLogin();

  if (login.loginMethod === 'otp' && login.otpSent) {
    return (
      <PhoneOtpScreen
        otpPhone={login.formData.fullPhoneNumber || login.formData.phone}
        otp={login.otp}
        setOtp={login.setOtp}
        otpError={login.errors.otp}
        otpLoading={login.isLoading}
        onSubmit={(e) => {
          e.preventDefault();
          login.handleVerifyOtp();
        }}
        onBack={login.resetOtp}
        onResend={login.handleSendOtp}
        resending={login.isLoading}
        title={login.t('auth.verifyYourContact')}
        inputLabel={login.t('auth.enterVerificationCode')}
        submitLabel={login.t('auth.verifyAndLogin')}
        backLabel={login.t('auth.backToLogin')}
      />
    );
  }

  return <AdminLoginForm login={login} />;
}
