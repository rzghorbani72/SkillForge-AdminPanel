'use client';

import { UseFormReturn, UseFormRegisterReturn } from 'react-hook-form';
import { AuthField, AuthPhoneField, AuthSubmit } from '@/components/auth/auth-fields';
import { LegalConsentCheckbox } from '@/components/auth/legal-consent-checkbox';
import { PasswordStrength } from '@/components/ui/password-strength';
import { useTranslation } from '@/lib/i18n/hooks';
import { sanitizePasswordInput } from '@/lib/password-utils';

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

const toPassword = (value: string) => sanitizePasswordInput(value);

/** Converts Persian digits and strips non-English password characters. */
const withAsciiPassword = (field: UseFormRegisterReturn): UseFormRegisterReturn => ({
  ...field,
  onChange: (event: { target: HTMLInputElement }) => {
    event.target.value = sanitizePasswordInput(event.target.value);
    return field.onChange(event);
  },
});

export function RegisterDetailsForm({
  form,
  loading,
  acceptedLegal,
  onAcceptedLegalChange,
  onSubmit,
}: RegisterDetailsFormProps) {
  const { t } = useTranslation();
  const { errors } = form.formState;

  const [name, phone, password, confirmPassword] = form.watch([
    'name',
    'phone',
    'password',
    'confirmPassword',
  ]);
  // Passwords are not trimmed — leading/trailing spaces can be intentional.
  const allFieldsFilled =
    name.trim() !== '' && phone.trim() !== '' && password !== '' && confirmPassword !== '';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <AuthField
        label={t('auth.fullName')}
        autoComplete="name"
        error={errors.name?.message}
        disabled={loading}
        {...form.register('name')}
      />

      <AuthPhoneField
        label={t('auth.phoneNumber')}
        error={errors.phone?.message}
        disabled={loading}
        value={phone}
        onValueChange={(v) => form.setValue('phone', v, { shouldDirty: true })}
      />

      <div className="space-y-1.5">
        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          disabled={loading}
          {...withAsciiPassword(form.register('password', { setValueAs: toPassword }))}
        />
        <PasswordStrength password={password} />
      </div>

      <AuthField
        label={t('auth.confirmPassword')}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        disabled={loading}
        {...withAsciiPassword(form.register('confirmPassword', { setValueAs: toPassword }))}
      />

      <LegalConsentCheckbox
        lead={t('auth.byCreatingAccount')}
        includeStaffTerms
        checked={acceptedLegal}
        onChange={onAcceptedLegalChange}
        disabled={loading}
      />

      <AuthSubmit loading={loading} disabled={loading || !acceptedLegal || !allFieldsFilled}>
        {loading ? t('auth.sending') : t('auth.registerTitle')}
      </AuthSubmit>
    </form>
  );
}
