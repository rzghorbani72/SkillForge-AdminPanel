import type { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import type { User } from '@/types/api';
import type { useContactOtp } from '../_hooks/use-contact-otp';
import { VerifiedContactField } from './verified-contact-field';

export interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

type ContactOtp = ReturnType<typeof useContactOtp>;

interface ContactFieldsProps {
  form: ProfileForm;
  setForm: Dispatch<SetStateAction<ProfileForm>>;
  user: User | null;
  phoneOtp: ContactOtp;
  emailOtp: ContactOtp;
}

export function ContactFields({ form, setForm, user, phoneOtp, emailOtp }: ContactFieldsProps) {
  const { t, language } = useTranslation();

  return (
    <>
      <VerifiedContactField
        id="phone"
        label={t('settings.phoneNumber')}
        value={form.phone}
        displayValue={formatPhoneDisplay(form.phone, language)}
        savedValue={user?.phone_number ?? ''}
        isConfirmed={user?.phone_confirmed === true}
        otp={phoneOtp.state}
        changeLabel={t('settings.changePhone')}
        verifyLabel={t('settings.verifyPhone')}
        onCodeChange={phoneOtp.setCode}
        onVerify={phoneOtp.verify}
        onSend={phoneOtp.send}
        canResend={phoneOtp.canResend}
        resendCooldown={phoneOtp.resendCooldown}
        onRevert={() => {
          setForm((current) => ({
            ...current,
            phone: user?.phone_number ?? '',
          }));
          phoneOtp.reset();
        }}
      >
        <LocalizedDigitsInput
          id="phone"
          autoComplete="tel"
          value={form.phone}
          onChange={(phone) => {
            setForm((current) => ({ ...current, phone }));
            phoneOtp.reset();
          }}
          placeholder={t('settings.phoneNumberPlaceholder')}
          className="flex-1"
        />
      </VerifiedContactField>

      <VerifiedContactField
        id="email"
        label={t('settings.email')}
        value={form.email}
        savedValue={user?.email ?? ''}
        isConfirmed={user?.email_confirmed === true}
        otp={emailOtp.state}
        changeLabel={t('settings.changeEmail')}
        verifyLabel={t('settings.verifyEmail')}
        onCodeChange={emailOtp.setCode}
        onVerify={emailOtp.verify}
        onSend={emailOtp.send}
        canResend={emailOtp.canResend}
        resendCooldown={emailOtp.resendCooldown}
        onRevert={() => {
          setForm((current) => ({
            ...current,
            email: user?.email ?? '',
          }));
          emailOtp.reset();
        }}
      >
        <Input
          id="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          value={form.email}
          onChange={(e) => {
            setForm((current) => ({ ...current, email: e.target.value }));
            emailOtp.reset();
          }}
          placeholder={t('settings.emailPlaceholder')}
          className="flex-1"
        />
      </VerifiedContactField>
    </>
  );
}
