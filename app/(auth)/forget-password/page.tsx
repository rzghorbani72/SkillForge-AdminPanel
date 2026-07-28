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

export default function ForgetPasswordPage() {
  const fp = useForgetPassword();
  const { t, step } = fp;

  const subtitle =
    step === 'identifier'
      ? t('forgotPassword.enterIdentifier')
      : step === 'otp'
        ? t('forgotPassword.enterOtp')
        : step === 'password'
          ? t('forgotPassword.enterNewPassword')
          : t('forgotPassword.canLoginNow');

  return (
    <AuthShell
      activeTab="forgot"
      title={t('forgotPassword.title')}
      subtitle={subtitle}
    >
      {step === 'identifier' && <IdentifierStep fp={fp} />}

      {step === 'otp' && (
        <PhoneOtpScreen
          embedded
          otpPhone={
            fp.authMethod === 'phone'
              ? fp.formData.fullPhoneNumber || fp.formData.phoneNumber
              : fp.formData.email
          }
          otp={fp.formData.otp}
          setOtp={(v) => fp.handleInputChange('otp', v)}
          otpLoading={fp.isLoading}
          otpError={fp.errors.otp}
          onSubmit={(e) => {
            e.preventDefault();
            fp.handleVerifyOtp();
          }}
          onBack={() => fp.setStep('identifier')}
          inputLabel={t('forgotPassword.verificationCode')}
          submitLabel={t('forgotPassword.verifyOtp')}
          backLabel={t('common.back')}
          onResend={fp.handleSendOtp}
          resending={fp.isLoading}
        />
      )}

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
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
