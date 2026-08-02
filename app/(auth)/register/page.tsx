'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { AuthSecondaryButton } from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from '@/components/ui/link';
import { toast } from 'react-toastify';
import {
  RegisterDetailsForm,
  type RegisterValues
} from './_components/register-details-form';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const loginHref = planParam
    ? `/login?plan=${encodeURIComponent(planParam)}`
    : '/login';

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [legalVersions, setLegalVersions] = useState<{
    terms: string | null;
    privacy: string | null;
  }>({ terms: null, privacy: null });

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => router.push(loginHref), 2200);
    return () => window.clearTimeout(timer);
  }, [done, router, loginHref]);

  useEffect(() => {
    apiClient
      .getLegalDocuments()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setLegalVersions({
          terms: list.find((d) => d.type === 'TERMS')?.version ?? null,
          privacy: list.find((d) => d.type === 'PRIVACY')?.version ?? null
        });
      })
      .catch(() => {
        setLegalVersions({ terms: null, privacy: null });
      });
  }, []);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(useRegisterSchema(t)),
    defaultValues: { name: '', phone: '', password: '', confirmPassword: '' }
  });

  // The notice belongs to the phone that was checked, so editing it clears it.
  const watchedPhone = form.watch('phone');
  useEffect(() => {
    setAlreadyRegistered(false);
  }, [watchedPhone]);

  async function onDetailsSubmit(values: RegisterValues) {
    if (!acceptedLegal) {
      toast.error(t('legal.mustAcceptTerms'));
      return;
    }
    setOtpLoading(true);
    setAlreadyRegistered(false);
    try {
      // Stop here rather than sending an SMS the account can never use.
      const check = await apiClient.checkSignupPhone(toE164Iran(values.phone));
      if (check?.data?.taken) {
        setAlreadyRegistered(true);
        return;
      }

      const response = await apiClient.sendPhoneOtp(
        toE164Iran(values.phone),
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      setStep('verify');
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

  async function verifyAndCreateAccount() {
    const values = form.getValues();
    const e164Phone = toE164Iran(values.phone);
    setVerifying(true);
    try {
      const verifyResult = (await apiClient.verifyPhoneOtp(
        e164Phone,
        otpCode,
        OtpType.REGISTER_PHONE_VERIFICATION
      )) as {
        data?: { success?: boolean; message?: string };
        success?: boolean;
        message?: string;
      };
      if (!verifyResult?.data?.success && !verifyResult?.success) {
        toast.error(verifyResult?.data?.message ?? t('common.error'));
        return;
      }

      let termsVersion = legalVersions.terms;
      let privacyVersion = legalVersions.privacy;
      try {
        const docsRes = await apiClient.getLegalDocuments();
        const list = Array.isArray(docsRes.data) ? docsRes.data : [];
        termsVersion = list.find((d) => d.type === 'TERMS')?.version ?? null;
        privacyVersion =
          list.find((d) => d.type === 'PRIVACY')?.version ?? null;
        setLegalVersions({ terms: termsVersion, privacy: privacyVersion });
      } catch {
        termsVersion = null;
        privacyVersion = null;
        setLegalVersions({ terms: null, privacy: null });
      }

      if (!termsVersion || !privacyVersion) {
        toast.error(t('legal.documentsUnavailable'), {
          toastId: 'register-legal-unavailable'
        });
        return;
      }

      await apiClient.register({
        name: values.name,
        phone_number: e164Phone,
        password: values.password,
        confirmed_password: values.confirmPassword,
        role: 'MANAGER',
        display_name: values.name,
        accepted_terms_version: termsVersion,
        accepted_privacy_version: privacyVersion
      });
      setDone(true);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'), {
        toastId: 'register-error'
      });
    } finally {
      setVerifying(false);
    }
  }

  async function resendOtp() {
    const phone = toE164Iran(form.getValues('phone'));
    setOtpLoading(true);
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
      <AuthStatusScreen
        title={t('auth.accountCreatedTitle')}
        message={t('auth.redirectingToSignIn')}
      />
    );
  }

  return (
    <AuthShell activeTab="register" title={t('auth.registerTitle')}>
      <div>
        {step === 'details' && alreadyRegistered && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <AlertDescription className="space-y-2">
              <p>{t('auth.phoneAlreadyRegistered')}</p>
              <Link
                href={loginHref}
                className="inline-block text-sm font-semibold text-primary hover:underline"
              >
                {t('auth.signIn')} →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {step === 'details' && (
          <RegisterDetailsForm
            form={form}
            loading={otpLoading}
            acceptedLegal={acceptedLegal}
            onAcceptedLegalChange={setAcceptedLegal}
            onSubmit={onDetailsSubmit}
          />
        )}

        {step === 'verify' &&
          (() => {
            const [descBefore, descAfter] = t('auth.verifyPhoneDesc').split(
              '{phone}'
            );
            const normalizedPhone = toE164Iran(form.getValues('phone'));
            return (
              <PhoneOtpScreen
                embedded
                otpPhone={normalizedPhone}
                otp={otpCode}
                setOtp={setOtpCode}
                otpLoading={verifying}
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyAndCreateAccount();
                }}
                onBack={() => setStep('details')}
                title={t('auth.verifyPhoneTitle')}
                subtitle={
                  <>
                    {descBefore}
                    <span className="font-semibold" dir="ltr">
                      {normalizedPhone}
                    </span>
                    {descAfter}
                  </>
                }
                inputLabel={t('auth.enterVerificationCode')}
                submitLabel={t('auth.verifySmsOtp')}
                backLabel={t('common.edit')}
                onResend={resendOtp}
                resending={otpLoading}
              />
            );
          })()}
      </div>
      <AuthSecondaryButton onClick={() => router.push(loginHref)}>
        {t('auth.signIn')}
      </AuthSecondaryButton>
    </AuthShell>
  );
}
