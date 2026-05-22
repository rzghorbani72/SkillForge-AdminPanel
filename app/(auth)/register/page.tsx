'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Sparkles,
  User,
  Lock,
  Phone
} from 'lucide-react';
import Link from '@/components/ui/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';
import { LanguageDetector } from '@/components/providers/language-detector';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

// ─── Validation ───────────────────────────────────────────────────────────

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

type RegisterValues = {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  // Step 1 → send phone OTP
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

      // TODO: Remove when real SMS/email provider is integrated
      if (response?.data?.otp) {
        toast.info(
          `${t('auth.sendVerificationCode')}\n\n🔐 Code: ${response.data.otp}`,
          {
            autoClose: 8000,
            style: { whiteSpace: 'pre-wrap' }
          }
        );
      } else {
        toast.info(t('auth.sendVerificationCode'));
      }
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setOtpLoading(false);
    }
  }

  // Step 2a → verify the OTP code only
  async function verifyCode() {
    const e164Phone = toE164Iran(form.getValues('phone'));
    setVerifying(true);
    try {
      const result = (await apiClient.verifyPhoneOtp(
        e164Phone,
        otpCode,
        OtpType.REGISTER_PHONE_VERIFICATION
      )) as any;
      if (!result?.data?.success && !result?.success) {
        toast.error(t('auth.enterVerificationCode'));
        return;
      }
      setPhoneVerified(true);
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setVerifying(false);
    }
  }

  // Step 2b → register only (phone already verified above)
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
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
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

      // TODO: Remove when real SMS/email provider is integrated
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

  // ─── Done screen ─────────────────────────────────────────────────────────

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

  // ─── Shared layout wrapper ────────────────────────────────────────────────

  return (
    <>
      <LanguageDetector />
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Language switcher */}
        <div className={cn('fixed top-4 z-50', isRTL ? 'left-4' : 'right-4')}>
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm">
          {/* Brand */}
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

          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {(['details', 'verify'] as const).map((s, idx) => {
              const isActive = step === s;
              const isDone = step === 'verify' && s === 'details';
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                          ? 'border-2 border-primary text-primary'
                          : 'border-2 border-muted-foreground/30 text-muted-foreground/40'
                    )}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  {idx === 0 && (
                    <div
                      className={cn(
                        'h-px w-10',
                        step === 'verify' ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            {/* ── Step 1: Details ── */}
            {step === 'details' && (
              <>
                <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('auth.yourDetails')}
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onDetailsSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.fullName')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User
                                className={cn(
                                  'absolute top-2.5 h-4 w-4 text-muted-foreground',
                                  isRTL ? 'right-3' : 'left-3'
                                )}
                              />
                              <Input
                                className={isRTL ? 'pr-9' : 'pl-9'}
                                placeholder={t('auth.fullNamePlaceholder')}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.phoneNumber')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone
                                className={cn(
                                  'absolute top-2.5 h-4 w-4 text-muted-foreground',
                                  isRTL ? 'right-3' : 'left-3'
                                )}
                              />
                              <Input
                                type="tel"
                                dir="ltr"
                                className={isRTL ? 'pr-9' : 'pl-9'}
                                placeholder={t('auth.phonePlaceholder')}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock
                                className={cn(
                                  'absolute top-2.5 h-4 w-4 text-muted-foreground',
                                  isRTL ? 'right-3' : 'left-3'
                                )}
                              />
                              <Input
                                type={showPw ? 'text' : 'password'}
                                className={cn(
                                  isRTL ? 'pl-9 pr-9' : 'pl-9 pr-9'
                                )}
                                placeholder={t('auth.passwordPlaceholder')}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="toggle"
                                className={cn(
                                  'absolute top-0 h-full w-9 text-muted-foreground hover:bg-transparent',
                                  isRTL ? 'left-0' : 'right-0'
                                )}
                                onClick={() => setShowPw((v) => !v)}
                              >
                                {showPw ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock
                                className={cn(
                                  'absolute top-2.5 h-4 w-4 text-muted-foreground',
                                  isRTL ? 'right-3' : 'left-3'
                                )}
                              />
                              <Input
                                type={showConfirm ? 'text' : 'password'}
                                className={cn(
                                  isRTL ? 'pl-9 pr-9' : 'pl-9 pr-9'
                                )}
                                placeholder={t(
                                  'auth.repeatPasswordPlaceholder'
                                )}
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="toggle confirm"
                                className={cn(
                                  'absolute top-0 h-full w-9 text-muted-foreground hover:bg-transparent',
                                  isRTL ? 'left-0' : 'right-0'
                                )}
                                onClick={() => setShowConfirm((v) => !v)}
                              >
                                {showConfirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="mt-2 w-full"
                      disabled={otpLoading}
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth.sending')}
                        </>
                      ) : (
                        t('auth.continueBtn')
                      )}
                    </Button>
                  </form>
                </Form>
              </>
            )}

            {/* ── Step 2: Verify email ── */}
            {step === 'verify' && (
              <div className="space-y-5">
                <div className="space-y-1 rounded-xl bg-primary/5 p-4 text-center">
                  <Phone className="mx-auto h-8 w-8 text-primary" />
                  <p className="text-sm font-semibold">
                    {t('auth.verifyPhoneTitle')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('auth.verifyPhoneDesc').replace(
                      '{phone}',
                      form.getValues('phone')
                    )}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="otp-code">
                    {t('auth.enterVerificationCode')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="otp-code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder={t('auth.verificationCodePlaceholder')}
                      maxLength={8}
                      dir="ltr"
                      disabled={phoneVerified}
                      className="text-center font-mono text-lg tracking-[0.3em]"
                    />
                    {!phoneVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={verifying || otpCode.length < 4}
                        onClick={verifyCode}
                        className="shrink-0"
                      >
                        {verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('auth.verifyEmailOtp')
                        )}
                      </Button>
                    )}
                  </div>
                  {phoneVerified && (
                    <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('auth.verified')}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full"
                  disabled={submitting || !phoneVerified}
                  onClick={createAccount}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.creatingAccount')}
                    </>
                  ) : (
                    t('auth.createAccount')
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setStep('details')}
                  >
                    ← {t('auth.backToLogin')}
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:underline disabled:opacity-50"
                    disabled={otpLoading}
                    onClick={resendOtp}
                  >
                    {otpLoading ? t('auth.resending') : t('auth.resendCode')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
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

          {/* Footer */}
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
