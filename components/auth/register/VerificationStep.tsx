'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { Loader2, Mail } from 'lucide-react';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

interface VerificationStepProps {
  formData: {
    email: string;
    phone: string;
    phoneOtp: string;
    emailOtp: string;
  };
  errors: Record<string, string>;
  otpLoading: boolean;
  isLoading: boolean;
  emailOtpSent: boolean;
  phoneOtpSent: boolean;
  emailOtpVerified: boolean;
  phoneOtpVerified: boolean;
  primaryMethod?: 'phone' | 'email';
  onChange: (field: string, value: string) => void;
  onSendPhone: () => Promise<void>;
  onVerifyPhone: () => Promise<void>;
  onSendEmail: () => Promise<void>;
  onVerifyEmail: () => Promise<void>;
}

export function VerificationStep(props: VerificationStepProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const {
    formData,
    errors,
    otpLoading,
    isLoading,
    emailOtpSent,
    phoneOtpSent,
    emailOtpVerified,
    phoneOtpVerified,
    primaryMethod = 'phone',
    onChange,
    onSendPhone,
    onVerifyPhone,
    onSendEmail,
    onVerifyEmail
  } = props;

  const isPhonePrimary = primaryMethod === 'phone';
  const isEmailPrimary = primaryMethod === 'email';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Show only primary verification method */}
      {isEmailPrimary ? (
        <div className="space-y-2">
          <InputWithIcon
            id="email"
            label={t('auth.emailAddress')}
            type="email"
            placeholder={t('auth.enterEmail')}
            value={formData.email}
            onChange={(value) => onChange('email', value)}
            icon={Mail}
            error={errors.email}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">{t('auth.verifyPhoneLater')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <PhoneInputWithCountry
            id="phone"
            label={t('auth.phoneNumber')}
            placeholder={t('auth.enterPhone')}
            value={formData.phone}
            onChange={(value) => onChange('phone', value)}
            onCountryChange={(countryCode) =>
              onChange('countryCode', countryCode)
            }
            error={errors.phone}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">{t('auth.verifyEmailLater')}</p>
        </div>
      )}

      {/* Show only primary method OTP section */}
      {isPhonePrimary ? (
        <div className="space-y-2">
          <Label htmlFor="phoneOtp">{t('auth.phoneOtp')}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="phoneOtp"
                type="text"
                placeholder={t('auth.enterPhoneOtp')}
                value={formData.phoneOtp}
                onChange={(e) => onChange('phoneOtp', e.target.value)}
                className={errors.phoneOtp ? 'border-red-500' : ''}
                disabled={isLoading || otpLoading}
                dir="ltr"
              />
            </div>
            <Button
              type="button"
              onClick={onSendPhone}
              disabled={
                otpLoading || !formData.phone || formData.phone.length < 7
              }
              className="whitespace-nowrap"
            >
              {otpLoading ? (
                <>
                  <Loader2
                    className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                  />{' '}
                  {t('auth.sending')}
                </>
              ) : phoneOtpSent ? (
                t('auth.resendSmsOtp')
              ) : (
                t('auth.sendPhoneOtp')
              )}
            </Button>
            <Button
              type="button"
              onClick={onVerifyPhone}
              disabled={otpLoading || !formData.phoneOtp || phoneOtpVerified}
              variant="outline"
              className="whitespace-nowrap"
            >
              {otpLoading ? (
                <>
                  <Loader2
                    className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                  />{' '}
                  {t('auth.verifying')}
                </>
              ) : phoneOtpVerified ? (
                t('auth.verified')
              ) : (
                t('auth.verifySmsOtp')
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="emailOtp">{t('auth.emailOtp')}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="emailOtp"
                type="text"
                placeholder={t('auth.enterEmailOtp')}
                value={formData.emailOtp}
                onChange={(e) => onChange('emailOtp', e.target.value)}
                className={errors.emailOtp ? 'border-red-500' : ''}
                disabled={isLoading || otpLoading}
                dir="ltr"
              />
            </div>
            <Button
              type="button"
              onClick={onSendEmail}
              disabled={
                otpLoading || !formData.email || !isValidEmail(formData.email)
              }
              className="whitespace-nowrap"
            >
              {otpLoading ? (
                <>
                  <Loader2
                    className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                  />{' '}
                  {t('auth.sending')}
                </>
              ) : emailOtpSent ? (
                t('auth.resendEmailOtp')
              ) : (
                t('auth.sendEmailOtp')
              )}
            </Button>
            <Button
              type="button"
              onClick={onVerifyEmail}
              disabled={otpLoading || !formData.emailOtp || emailOtpVerified}
              variant="outline"
              className="whitespace-nowrap"
            >
              {otpLoading ? (
                <>
                  <Loader2
                    className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`}
                  />{' '}
                  {t('auth.verifying')}
                </>
              ) : emailOtpVerified ? (
                t('auth.verified')
              ) : (
                t('auth.verifyEmailOtp')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
