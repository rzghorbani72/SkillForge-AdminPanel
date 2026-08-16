'use client';

import { useLogin } from './use-login';
import { IdentifyStep } from '@/components/auth/identify-step';
import { PasswordStep } from '@/components/auth/password-step';
import { AcademyPicker } from './_components/academy-picker';
import { MemberAcademiesScreen } from './_components/member-academies-screen';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { SetNewPasswordScreen } from '@/components/auth/set-new-password-screen';
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

  if (login.passwordResetRequired) {
    return (
      <SetNewPasswordScreen
        loading={login.resetLoading}
        error={login.resetError}
        onSubmit={login.handleSetNewPasswordSubmit}
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
              href={login.registerHref}
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.createAccountToContinue')} →
            </Link>
          </div>
        )}
      </PhoneOtpScreen>
    );
  }

  if (login.memberElsewhere) {
    return (
      <MemberAcademiesScreen
        phoneE164={login.phoneE164}
        registerHref={login.registerHref}
        onChangeIdentifier={login.changeIdentifier}
      />
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

  if (login.identity) {
    return (
      <PasswordStep
        title={t('auth.loginTitle')}
        identifier={login.phone}
        forgotPasswordHref="/forget-password"
        password={login.password}
        canUseOtp={login.identity.can_use_otp}
        isLoading={login.isLoading}
        error={login.errors.password}
        captchaRequired={login.captchaRequired}
        onCaptchaVerify={login.setCaptchaToken}
        onPasswordChange={(v) => {
          login.setPassword(v);
          if (login.errors.password)
            login.setErrors((p) => ({ ...p, password: '' }));
        }}
        onUseOtp={login.useOtpInstead}
        onChangeIdentifier={login.changeIdentifier}
        onSubmit={login.handleSubmit}
      />
    );
  }

  return (
    <IdentifyStep
      title={t('auth.loginTitle')}
      identifier={login.phone}
      isLoading={login.isLoading}
      error={login.errors.phone}
      notice={login.unauthorizedError}
      notRegistered={login.registrationRequired}
      registerHref={login.registerHref}
      captchaRequired={login.captchaRequired}
      onCaptchaVerify={login.setCaptchaToken}
      onIdentifierChange={(v) => {
        login.setPhone(v);
        if (login.errors.phone) login.setErrors((p) => ({ ...p, phone: '' }));
        if (login.registrationRequired) login.clearRegistrationHint();
      }}
      onSubmit={login.handleSubmit}
    />
  );
}
