'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { Loader2, Mail } from 'lucide-react';
import { isValidEmail, isValidPhone } from '@/lib/utils';

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
  onChange: (field: string, value: string) => void;
  onSendPhone: () => Promise<void>;
  onVerifyPhone: () => Promise<void>;
  onSendEmail: () => Promise<void>;
  onVerifyEmail: () => Promise<void>;
}

export function VerificationStep(props: VerificationStepProps) {
  const {
    formData,
    errors,
    otpLoading,
    isLoading,
    emailOtpSent,
    phoneOtpSent,
    emailOtpVerified,
    phoneOtpVerified,
    onChange,
    onSendPhone,
    onVerifyPhone,
    onSendEmail,
    onVerifyEmail
  } = props;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputWithIcon
          id="email"
          label="Email Address (Optional)"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(value) => onChange('email', value)}
          icon={Mail}
          error={errors.email}
          disabled={isLoading}
        />
        <PhoneInputWithCountry
          id="phone"
          label="Phone Number"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(value) => onChange('phone', value)}
          onCountryChange={(countryCode) =>
            onChange('countryCode', countryCode)
          }
          error={errors.phone}
          disabled={isLoading}
        />
      </div>

      {/* Phone OTP */}
      <div className="space-y-2">
        <Label htmlFor="phoneOtp">Phone OTP</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="phoneOtp"
              type="text"
              placeholder="Enter phone OTP"
              value={formData.phoneOtp}
              onChange={(e) => onChange('phoneOtp', e.target.value)}
              className={errors.phoneOtp ? 'border-red-500' : ''}
              disabled={isLoading || otpLoading}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : phoneOtpSent ? (
              'Resend SMS OTP'
            ) : (
              'Send Phone OTP'
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : phoneOtpVerified ? (
              '✓ Verified'
            ) : (
              'Verify SMS OTP'
            )}
          </Button>
        </div>
      </div>

      {/* Email OTP */}
      <div className="space-y-2">
        <Label htmlFor="emailOtp">Email OTP</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="emailOtp"
              type="text"
              placeholder="Enter email OTP"
              value={formData.emailOtp}
              onChange={(e) => onChange('emailOtp', e.target.value)}
              className={errors.emailOtp ? 'border-red-500' : ''}
              disabled={isLoading || otpLoading}
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : emailOtpSent ? (
              'Resend Email OTP'
            ) : (
              'Send Email OTP'
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : emailOtpVerified ? (
              '✓ Verified'
            ) : (
              'Verify Email OTP'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
