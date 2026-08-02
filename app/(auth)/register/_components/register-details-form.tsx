'use client';

import { UseFormReturn } from 'react-hook-form';
import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';
import { toEnglishDigits } from '@/lib/phone-utils';

export type RegisterValues = {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

interface RegisterDetailsFormProps {
  form: UseFormReturn<RegisterValues>;
  loading: boolean;
  acceptedLegal: boolean;
  onAcceptedLegalChange: (value: boolean) => void;
  onSubmit: (values: RegisterValues) => void;
}

const toEnglish = (value: string) => toEnglishDigits(value);

export function RegisterDetailsForm({
  form,
  loading,
  acceptedLegal,
  onAcceptedLegalChange,
  onSubmit
}: RegisterDetailsFormProps) {
  const { t } = useTranslation();
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <AuthField
        label={t('auth.fullName')}
        autoComplete="name"
        error={errors.name?.message}
        disabled={loading}
        {...form.register('name')}
      />

      <AuthField
        label={t('auth.phoneNumber')}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        disabled={loading}
        {...form.register('phone', { setValueAs: toEnglish })}
      />

      <AuthField
        label={t('auth.password')}
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={loading}
        {...form.register('password', { setValueAs: toEnglish })}
      />

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={loading}
        {...form.register('confirmPassword', { setValueAs: toEnglish })}
      />

      <label className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(e) => onAcceptedLegalChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {t('auth.byCreatingAccount')}{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            {t('auth.termsOfService')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t('auth.privacyPolicy')}
          </Link>
          {t('auth.agree')}
        </span>
      </label>

      <AuthSubmit loading={loading} disabled={loading || !acceptedLegal}>
        {loading ? t('auth.sending') : t('auth.continueBtn')}
      </AuthSubmit>
    </form>
  );
}
