'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import {
  checkoutQueryFromSearch,
  homeRouteFor,
  resolveSessionRole
} from '@/lib/auth-routing';
import { OtpType } from '@/constants/data';
import { useTranslation } from '@/lib/i18n/hooks';
import { toE164Iran } from '@/lib/phone-utils';
import { AuthShell } from '@/components/auth/auth-shell';
import { AuthStatusScreen } from '@/components/auth/auth-status-screen';
import { PhoneOtpScreen } from '@/components/auth/phone-otp-screen';
import { AuthSecondaryLink } from '@/components/auth/auth-fields';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from '@/components/ui/link';
import { toast } from 'react-toastify';
import { notifyOtpSent } from '@/lib/otp-notify';
import { apiErrorMessage } from '@/lib/api-error-message';
import {
  authField,
  validateConfirmPassword,
  validateFullName,
  validateNewPassword,
  validatePhone,
  type Translate
} from '@/lib/auth-validation';
import {
  RegisterDetailsForm,
  type RegisterValues
} from './_components/register-details-form';

const useRegisterSchema = (t: Translate) =>
  z
    .object({
      name: authField(validateFullName, t),
      phone: authField(validatePhone, t),
      password: authField(validateNewPassword, t),
      confirmPassword: z.string()
    })
    .superRefine((values, ctx) => {
      const key = validateConfirmPassword(
        values.password,
        values.confirmPassword
      );
      if (key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t(key),
          path: ['confirmPassword']
        });
      }
    });

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const periodParam = searchParams.get('period');
  const planQuery = checkoutQueryFromSearch(planParam, periodParam);
  // Login sends the number it could not find, so signup never asks for it twice.
  const phoneParam = searchParams.get('phone') ?? '';
  const loginHref = planQuery ? `/login${planQuery}` : '/login';

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
    defaultValues: {
      name: '',
      phone: phoneParam,
      password: '',
      confirmPassword: ''
    }
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
      notifyOtpSent(
        response?.data?.message ?? t('auth.sendVerificationCode'),
        'register-otp-sent'
      );
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')), {
        toastId: 'register-otp-error'
      });
    } finally {
      setOtpLoading(false);
    }
  }

  /**
   * Signup already proved the phone and set the password, so a second manual
   * login adds nothing. If it fails the account still exists — fall back to the
   * login page instead of showing a signup error.
   */
  async function signInNewAccount(identifier: string, password: string) {
    setDone(true);
    try {
      const session = await authService.login({ identifier, password });
      // No role means no session was created — the backend answered with a
      // verification/reset gate the login page knows how to finish, not us.
      const role = resolveSessionRole(session);
      if (!role) {
        router.replace(loginHref);
        return;
      }
      router.replace(homeRouteFor(role, { planQuery }) ?? '/dashboard');
    } catch {
      router.replace(loginHref);
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
      await signInNewAccount(e164Phone, values.password);
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')), {
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
      notifyOtpSent(t('auth.resendCode'), 'register-otp-resent');
    } catch (err: unknown) {
      toast.error(apiErrorMessage(err, t('common.error')), {
        toastId: 'register-otp-error'
      });
    } finally {
      setOtpLoading(false);
    }
  }

  if (done) {
    return (
      <AuthStatusScreen
        title={t('auth.accountCreatedTitle')}
        message={t('auth.redirectingToDashboard')}
      />
    );
  }

  if (step === 'verify') {
    return (
      <PhoneOtpScreen
        activeTab="register"
        otpPhone={toE164Iran(form.getValues('phone'))}
        otp={otpCode}
        setOtp={setOtpCode}
        otpLoading={verifying}
        onSubmit={verifyAndCreateAccount}
        onBack={() => setStep('details')}
        title={t('auth.verifyPhoneTitle')}
        submitLabel={t('auth.verifySmsOtp')}
        onResend={resendOtp}
        resending={otpLoading}
      />
    );
  }

  return (
    <AuthShell activeTab="register" title={t('auth.registerTitle')}>
      <div>
        {alreadyRegistered && (
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

        <RegisterDetailsForm
          form={form}
          loading={otpLoading}
          acceptedLegal={acceptedLegal}
          onAcceptedLegalChange={setAcceptedLegal}
          onSubmit={onDetailsSubmit}
        />
      </div>
      <AuthSecondaryLink href={loginHref}>{t('auth.signIn')}</AuthSecondaryLink>
    </AuthShell>
  );
}
