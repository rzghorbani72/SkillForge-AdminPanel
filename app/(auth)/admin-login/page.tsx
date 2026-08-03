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
        onSubmit={login.handleVerifyOtp}
        onBack={login.resetOtp}
        onResend={login.handleSendOtp}
        resending={login.isLoading}
      />
    );
  }

  return <AdminLoginForm login={login} />;
}
