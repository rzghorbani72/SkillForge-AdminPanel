'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { Loader2, Mail, Phone } from 'lucide-react';
import { OtpType } from '@/constants/data';

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminUserDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateAdminUserDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+98',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpData, setOtpData] = useState({
    phoneOtp: '',
    emailOtp: ''
  });

  const [otpSent, setOtpSent] = useState({
    phone: false,
    email: false
  });

  const [otpVerified, setOtpVerified] = useState({
    phone: false,
    email: false
  });

  const handleSendPhoneOtp = async () => {
    if (!formData.phone || !formData.countryCode) {
      ErrorHandler.showError(t('createAdminUser.phoneNumberRequired'));
      return;
    }

    try {
      setIsSendingOtp(true);
      const fullPhone = `${formData.countryCode}${formData.phone.replace(/^\+/, '')}`;
      await apiClient.sendPhoneOtp(
        fullPhone,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      setOtpSent((prev) => ({ ...prev, phone: true }));
      ErrorHandler.showSuccess(t('createAdminUser.phoneOtpSent'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email) {
      ErrorHandler.showError(t('createAdminUser.emailRequired'));
      return;
    }

    try {
      setIsSendingOtp(true);
      await apiClient.sendEmailOtp(
        formData.email,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      setOtpSent((prev) => ({ ...prev, email: true }));
      ErrorHandler.showSuccess(t('createAdminUser.emailOtpSent'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpData.phoneOtp) {
      ErrorHandler.showError(t('createAdminUser.pleaseEnterPhoneOtp'));
      return;
    }

    try {
      setIsLoading(true);
      const fullPhone = `${formData.countryCode}${formData.phone.replace(/^\+/, '')}`;
      await apiClient.verifyPhoneOtp(
        fullPhone,
        otpData.phoneOtp,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      setOtpVerified((prev) => ({ ...prev, phone: true }));
      ErrorHandler.showSuccess(t('createAdminUser.phoneOtpVerified'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!otpData.emailOtp) {
      ErrorHandler.showError(t('createAdminUser.pleaseEnterEmailOtp'));
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.verifyEmailOtp(
        formData.email,
        otpData.emailOtp,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      setOtpVerified((prev) => ({ ...prev, email: true }));
      ErrorHandler.showSuccess(t('createAdminUser.emailOtpVerified'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified.phone || !otpVerified.email) {
      ErrorHandler.showError(t('createAdminUser.pleaseVerifyBothOtps'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      ErrorHandler.showError(t('createAdminUser.passwordsDoNotMatch'));
      return;
    }

    try {
      setIsLoading(true);
      const fullPhone = `${formData.countryCode}${formData.phone.replace(/^\+/, '')}`;

      await apiClient.createAdminUser({
        name: formData.name,
        phone_number: fullPhone,
        email: formData.email,
        password: formData.password,
        phone_otp: otpData.phoneOtp,
        email_otp: otpData.emailOtp
      });

      ErrorHandler.showSuccess(t('createAdminUser.adminUserCreatedSuccess'));
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      countryCode: '+98',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setOtpData({
      phoneOtp: '',
      emailOtp: ''
    });
    setOtpSent({ phone: false, email: false });
    setOtpVerified({ phone: false, email: false });
    setStep('form');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createAdminUser.title')}</DialogTitle>
          <DialogDescription>
            {t('createAdminUser.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('createAdminUser.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t('createAdminUser.namePlaceholder')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('createAdminUser.phoneNumber')} *</Label>
            <PhoneInputWithCountry
              id="phone"
              label=""
              value={formData.phone}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, phone: value }))
              }
              onCountryChange={(code) =>
                setFormData((prev) => ({ ...prev, countryCode: code }))
              }
              disabled={isLoading || otpVerified.phone}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendPhoneOtp}
                disabled={isSendingOtp || !formData.phone || otpVerified.phone}
                size="sm"
              >
                {isSendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {otpSent.phone
                  ? t('createAdminUser.resendOtp')
                  : t('createAdminUser.sendOtp')}
              </Button>
              {otpSent.phone && !otpVerified.phone && (
                <>
                  <Input
                    placeholder={t('createAdminUser.enterPhoneOtp')}
                    value={otpData.phoneOtp}
                    onChange={(e) =>
                      setOtpData((prev) => ({
                        ...prev,
                        phoneOtp: e.target.value
                      }))
                    }
                    className="max-w-[150px]"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyPhoneOtp}
                    disabled={isLoading || !otpData.phoneOtp}
                    size="sm"
                  >
                    {t('createAdminUser.verify')}
                  </Button>
                </>
              )}
              {otpVerified.phone && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Phone className="h-4 w-4" />
                  {t('createAdminUser.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('createAdminUser.email')} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder={t('createAdminUser.emailPlaceholder')}
              required
              disabled={isLoading || otpVerified.email}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmailOtp}
                disabled={isSendingOtp || !formData.email || otpVerified.email}
                size="sm"
              >
                {isSendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {otpSent.email
                  ? t('createAdminUser.resendOtp')
                  : t('createAdminUser.sendOtp')}
              </Button>
              {otpSent.email && !otpVerified.email && (
                <>
                  <Input
                    placeholder={t('createAdminUser.enterEmailOtp')}
                    value={otpData.emailOtp}
                    onChange={(e) =>
                      setOtpData((prev) => ({
                        ...prev,
                        emailOtp: e.target.value
                      }))
                    }
                    className="max-w-[150px]"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyEmailOtp}
                    disabled={isLoading || !otpData.emailOtp}
                    size="sm"
                  >
                    {t('createAdminUser.verify')}
                  </Button>
                </>
              )}
              {otpVerified.email && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Mail className="h-4 w-4" />
                  {t('createAdminUser.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('createAdminUser.password')} *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={t('createAdminUser.passwordPlaceholder')}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('createAdminUser.confirmPassword')} *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))
              }
              placeholder={t('createAdminUser.confirmPasswordPlaceholder')}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !otpVerified.phone || !otpVerified.email}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createAdminUser.createAdminUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
