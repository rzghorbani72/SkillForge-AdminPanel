'use client';

import { AlertCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from '@/components/ui/link';
import { useForgetPassword } from './use-forget-password';
import { IdentifierStep } from './_components/identifier-step';
import { PasswordStep } from './_components/password-step';
import { SuccessStep } from './_components/success-step';
import { AnonymousAuthGate } from '@/components/auth/anonymous-auth-gate';

export default function ForgetPasswordPage() {
  return (
    <AnonymousAuthGate>
      <ForgetPasswordBody />
    </AnonymousAuthGate>
  );
}

function ForgetPasswordBody() {
  const fp = useForgetPassword();
  const { t, step } = fp;

  const subtitle =
    step === 'identifier'
      ? t('forgotPassword.enterIdentifier')
      : step === 'password'
        ? t('forgotPassword.enterNewPassword')
        : t('forgotPassword.canLoginNow');

  if (step === 'otp') {
    return (
      <PhoneOtpScreen
        activeTab="forgot"
        otpPhone={fp.formData.fullPhoneNumber || fp.formData.phoneNumber}
        otp={fp.formData.otp}
        setOtp={(v) => fp.handleInputChange('otp', v)}
        otpLoading={fp.isLoading}
        otpError={fp.errors.otp}
        onSubmit={fp.handleVerifyOtp}
        onBack={() => fp.setStep('identifier')}
        title={t('forgotPassword.title')}
        submitLabel={t('forgotPassword.verifyOtp')}
        onResend={fp.handleSendOtp}
        resending={fp.isLoading}
      />
    );
  }

  return (
    <AuthShell activeTab="forgot" title={t('forgotPassword.title')} subtitle={subtitle}>
      {step === 'identifier' && <IdentifierStep fp={fp} />}

      {step === 'password' && <PasswordStep fp={fp} />}
      {step === 'success' && <SuccessStep fp={fp} />}

      {fp.message && (
        <Alert className="mt-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fp.message}</AlertDescription>
        </Alert>
      )}

      {step !== 'success' && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
