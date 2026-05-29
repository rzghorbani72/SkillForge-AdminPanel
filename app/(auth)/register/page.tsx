'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Link from '@/components/ui/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { StepIndicator } from './_components/step-indicator';
import {
  RegisterDetailsForm,
  type RegisterValues
} from './_components/register-details-form';
import { RegisterOtpStep } from './_components/register-otp-step';

const useRegisterSchema = (t: (k: string) => string) =>
  z
    .object({
      name: z.string().min(2, t('auth.fullNameRequired')),
      phone: z.string().min(7, t('auth.validPhoneNumber')),
      password: z.string().min(6, t('auth.passwordTooShort')),
      confirmPassword: z.string().min(1, t('auth.confirmPasswordRequired'))
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('auth.passwordsDoNotMatch'),
      path: ['confirmPassword']
    });

export default function RegisterPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(useRegisterSchema(t)),
    defaultValues: { name: '', phone: '', password: '', confirmPassword: '' }
  });

  async function onDetailsSubmit(values: RegisterValues) {
    setOtpLoading(true);
    try {
      const response = await apiClient.sendPhoneOtp(
        toE164Iran(values.phone),
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      setStep('verify');
      setPhoneVerified(false);
      setOtpCode('');

      // TODO: Remove debug OTP display when real SMS provider is integrated
      const sentMsg = response?.data?.message ?? t('auth.sendVerificationCode');
      if (response?.data?.otp) {
        toast.info(`${sentMsg}\n\n🔐 Code: ${response.data.otp}`, {
          autoClose: 8000,
          style: { whiteSpace: 'pre-wrap' }
        });
      } else {
        toast.info(sentMsg);
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyCode() {
    const e164Phone = toE164Iran(form.getValues('phone'));
    setVerifying(true);
    try {
      const result = (await apiClient.verifyPhoneOtp(
        e164Phone,
        otpCode,
        OtpType.REGISTER_PHONE_VERIFICATION
      )) as {
        data?: { success?: boolean; message?: string };
        success?: boolean;
        message?: string;
      };
      if (!result?.data?.success && !result?.success) {
        toast.error(result?.data?.message ?? t('common.error'));
        return;
      }
      toast.success(result?.data?.message ?? t('auth.verified'));
      setPhoneVerified(true);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setVerifying(false);
    }
  }

  async function createAccount() {
    const values = form.getValues();
    const e164Phone = toE164Iran(values.phone);
    setSubmitting(true);
    try {
      await apiClient.register({
        name: values.name,
        phone_number: e164Phone,
        password: values.password,
        confirmed_password: values.confirmPassword,
        role: 'MANAGER',
        display_name: values.name
      });
      setDone(true);
      toast.success(t('auth.accountCreatedTitle'));
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    const phone = toE164Iran(form.getValues('phone'));
    setOtpLoading(true);
    setPhoneVerified(false);
    setOtpCode('');
    try {
      const response = await apiClient.sendPhoneOtp(
        phone,
        OtpType.REGISTER_PHONE_VERIFICATION
      );

      // TODO: Remove when real SMS provider is integrated
      if (response?.data?.otp) {
        toast.info(`${t('auth.resendCode')}\n\n🔐 Code: ${response.data.otp}`, {
          autoClose: 8000,
          style: { whiteSpace: 'pre-wrap' }
        });
      } else {
        toast.info(t('auth.resendCode'));
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setOtpLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h2 className="text-xl font-bold">{t('auth.accountCreatedTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('auth.redirectingToSignIn')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LanguageDetector />
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
        dir="rtl"
      >
        <div className={cn('fixed top-4 z-50', isRTL ? 'left-4' : 'right-4')}>
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('auth.registerTitle')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          <StepIndicator totalSteps={2} current={step === 'details' ? 0 : 1} />

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            {step === 'details' && (
              <RegisterDetailsForm
                form={form}
                loading={otpLoading}
                onSubmit={onDetailsSubmit}
              />
            )}

            {step === 'verify' && (
              <RegisterOtpStep
                phone={form.getValues('phone')}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                otpLoading={otpLoading}
                verifying={verifying}
                phoneVerified={phoneVerified}
                submitting={submitting}
                onVerify={verifyCode}
                onCreateAccount={createAccount}
                onResend={resendOtp}
                onBack={() => setStep('details')}
              />
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('auth.byCreatingAccount')}{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              {t('auth.termsOfService')}
            </Link>{' '}
            {t('auth.and')}{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              {t('auth.privacyPolicy')}
            </Link>
            {t('auth.agree')}
          </p>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
