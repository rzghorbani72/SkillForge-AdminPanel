'use client';

import { useLogin } from './use-login';
import { LoginForm } from './_components/login-form';
import { AcademyPicker } from './_components/academy-picker';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';

export default function LoginPage() {
  const login = useLogin();
  const { t } = useTranslation();

  if (login.redirectPending) {
    return (
      <AuthStatusScreen
        title={login.redirectPending.title}
        message={login.redirectPending.message}
      />
    );
  }

  if (login.otpRequired) {
    return (
      <PhoneOtpScreen
        otpPhone={login.otpPhone}
        otp={login.otp}
        setOtp={login.setOtp}
        otpError={login.otpError}
        otpLoading={login.otpLoading}
        onSubmit={login.handleOtpSubmit}
        onBack={login.resetOtp}
        onResend={login.resendOtp}
        resending={login.otpLoading}
      >
        {login.registrationRequired && (
          <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p>{t('auth.registerToLoginHint')}</p>
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.createAccountToContinue')} →
            </Link>
          </div>
        )}
      </PhoneOtpScreen>
    );
  }

  if (login.academyPickerOpen) {
    return (
      <AcademyPicker
        academies={login.availableAcademies}
        loading={login.pickingAcademy}
        onSelect={login.handleAcademySelect}
        onBack={login.closeAcademyPicker}
      />
    );
  }

  return (
    <LoginForm
      loginMethod={login.loginMethod}
      onLoginMethodChange={login.setLoginMethod}
      phone={login.phone}
      password={login.password}
      showPassword={login.showPassword}
      isLoading={login.isLoading}
      errors={login.errors}
      unauthorizedError={login.unauthorizedError}
      registrationRequired={login.registrationRequired}
      onPhoneChange={(v) => {
        login.setPhone(v);
        if (login.errors.phone) login.setErrors((p) => ({ ...p, phone: '' }));
        if (login.registrationRequired) login.clearRegistrationHint();
      }}
      onPasswordChange={(v) => {
        login.setPassword(v);
        if (login.errors.password)
          login.setErrors((p) => ({ ...p, password: '' }));
      }}
      onTogglePassword={login.toggleShowPassword}
      onSubmit={login.handleSubmit}
    />
  );
}
