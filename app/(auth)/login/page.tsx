'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { apiClient } from '@/lib/api';
import { homeRouteFor, resolveSessionRole } from '@/lib/auth-routing';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { t } = useTranslation();

  // The session cookie is HttpOnly, so this is the only way a client component
  // can know "already logged in" before rendering the form. Without this check,
  // an already-authenticated visitor sees the login form for a moment (and can
  // start typing) before the check resolves and sends them to their dashboard.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        const home = homeRouteFor(resolveSessionRole(user));
        if (home) {
          router.replace(home);
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checkingSession) {
    return null;
  }

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
