'use client';

import { UseFormReturn } from 'react-hook-form';
import { AuthField, AuthSubmit } from '@/components/auth/auth-fields';
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
  onSubmit: (values: RegisterValues) => void;
}

const toEnglish = (value: string) => toEnglishDigits(value);

export function RegisterDetailsForm({
  form,
  loading,
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
        dir="ltr"
        autoComplete="tel"
        error={errors.phone?.message}
        disabled={loading}
        {...form.register('phone', { setValueAs: toEnglish })}
      />

      <AuthField
        label={t('auth.password')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={loading}
        {...form.register('password', { setValueAs: toEnglish })}
      />

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        dir="ltr"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={loading}
        {...form.register('confirmPassword', { setValueAs: toEnglish })}
      />

      <AuthSubmit loading={loading} disabled={loading}>
        {loading ? t('auth.sending') : t('auth.continueBtn')}
      </AuthSubmit>
    </form>
  );
}
