'use client';

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhoneInputWithCountry } from '@/components/ui/phone-input-with-country';
import { useTranslation } from '@/lib/i18n/hooks';
import { Loader2, Mail, Phone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { HumanCheck } from '@/components/auth/human-check';
import type { Dispatch, SetStateAction, FormEvent } from 'react';
import { PlatformStaffRole } from '../_lib/create-admin-user-dialog-helpers';

export function CreateAdminUserForm({
  canAssignAdmin,
  captcha,
  formData,
  handleClose,
  handleSendEmailOtp,
  handleSendPhoneOtp,
  handleSubmit,
  handleVerifyEmailOtp,
  handleVerifyPhoneOtp,
  isLoading,
  isSendingOtp,
  otpData,
  otpSent,
  otpVerified,
  platformRole,
  setFormData,
  setOtpData,
  setPlatformRole,
  showPlatformRoles,
}: {
  canAssignAdmin: boolean;
  captcha: {
    token: string;
    setToken: Dispatch<SetStateAction<string>>;
    resetKey: number;
    reset: () => void;
    solved: boolean;
  };
  formData: {
    name: string;
    phone: string;
    countryCode: string;
    email: string;
    password: string;
    confirmPassword: string;
    autoConfirmEmail: boolean;
    autoConfirmPhone: boolean;
  };
  handleClose: (open: boolean) => void;
  handleSendEmailOtp: () => Promise<void>;
  handleSendPhoneOtp: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleVerifyEmailOtp: () => Promise<void>;
  handleVerifyPhoneOtp: () => Promise<void>;
  isLoading: boolean;
  isSendingOtp: boolean;
  otpData: { phoneOtp: string; emailOtp: string };
  otpSent: { phone: boolean; email: boolean };
  otpVerified: { phone: boolean; email: boolean };
  platformRole: PlatformStaffRole;
  setFormData: Dispatch<
    SetStateAction<{
      name: string;
      phone: string;
      countryCode: string;
      email: string;
      password: string;
      confirmPassword: string;
      autoConfirmEmail: boolean;
      autoConfirmPhone: boolean;
    }>
  >;
  setOtpData: Dispatch<SetStateAction<{ phoneOtp: string; emailOtp: string }>>;
  setPlatformRole: Dispatch<SetStateAction<PlatformStaffRole>>;
  showPlatformRoles: boolean;
}) {
  const { t } = useTranslation();
  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{t('createAdminUser.title')}</DialogTitle>
        <DialogDescription>{t('createAdminUser.description')}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone and e-mail verify side by side — stacked, their OTP rows
        made this panel twice the height of the screen. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={showPlatformRoles ? 'space-y-2' : 'space-y-2 sm:col-span-2'}>
            <Label htmlFor="name">{t('createAdminUser.name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('createAdminUser.namePlaceholder')}
              required
              disabled={isLoading}
            />
          </div>

          {showPlatformRoles && (
            <div className="space-y-2">
              <Label htmlFor="platformRole">{t('createAdminUser.platformRole')}</Label>
              <Select
                value={platformRole}
                onValueChange={(v) => setPlatformRole(v as PlatformStaffRole)}
                disabled={isLoading}
              >
                <SelectTrigger id="platformRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canAssignAdmin && (
                    <SelectItem value="ADMIN">{t('admins.platformStaff.ADMIN')}</SelectItem>
                  )}
                  <SelectItem value="FINANCE">{t('admins.platformStaff.FINANCE')}</SelectItem>
                  <SelectItem value="SUPPORT">{t('admins.platformStaff.SUPPORT')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">{t('createAdminUser.phoneNumber')} *</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoConfirmPhone"
                  checked={formData.autoConfirmPhone}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      autoConfirmPhone: checked === true,
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="autoConfirmPhone" className="cursor-pointer text-sm font-normal">
                  {t('createAdminUser.autoConfirmPhone')}
                </Label>
              </div>
            </div>
            <PhoneInputWithCountry
              id="phone"
              label=""
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              onCountryChange={(code) => setFormData((prev) => ({ ...prev, countryCode: code }))}
              disabled={isLoading || (otpVerified.phone && !formData.autoConfirmPhone)}
            />
            <HumanCheck key={captcha.resetKey} onVerify={captcha.setToken} />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendPhoneOtp}
                disabled={
                  isSendingOtp ||
                  !captcha.solved ||
                  !formData.phone ||
                  otpVerified.phone ||
                  formData.autoConfirmPhone
                }
                size="sm"
              >
                {isSendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {otpSent.phone ? t('createAdminUser.resendOtp') : t('createAdminUser.sendOtp')}
              </Button>
              {otpSent.phone && !otpVerified.phone && !formData.autoConfirmPhone && (
                <>
                  <Input
                    placeholder={t('createAdminUser.enterPhoneOtp')}
                    value={otpData.phoneOtp}
                    onChange={(e) =>
                      setOtpData((prev) => ({
                        ...prev,
                        phoneOtp: e.target.value,
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
              {(otpVerified.phone || formData.autoConfirmPhone) && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Phone className="h-4 w-4" />
                  {formData.autoConfirmPhone
                    ? t('createAdminUser.autoConfirmed')
                    : t('createAdminUser.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">{t('createAdminUser.email')} *</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoConfirmEmail"
                  checked={formData.autoConfirmEmail}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      autoConfirmEmail: checked === true,
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="autoConfirmEmail" className="cursor-pointer text-sm font-normal">
                  {t('createAdminUser.autoConfirmEmail')}
                </Label>
              </div>
            </div>
            <Input
              id="email"
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('createAdminUser.emailPlaceholder')}
              required
              disabled={isLoading || (otpVerified.email && !formData.autoConfirmEmail)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSendEmailOtp}
                disabled={
                  isSendingOtp ||
                  !captcha.solved ||
                  !formData.email ||
                  otpVerified.email ||
                  formData.autoConfirmEmail
                }
                size="sm"
              >
                {isSendingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {otpSent.email ? t('createAdminUser.resendOtp') : t('createAdminUser.sendOtp')}
              </Button>
              {otpSent.email && !otpVerified.email && !formData.autoConfirmEmail && (
                <>
                  <Input
                    placeholder={t('createAdminUser.enterEmailOtp')}
                    value={otpData.emailOtp}
                    onChange={(e) =>
                      setOtpData((prev) => ({
                        ...prev,
                        emailOtp: e.target.value,
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
              {(otpVerified.email || formData.autoConfirmEmail) && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Mail className="h-4 w-4" />
                  {formData.autoConfirmEmail
                    ? t('createAdminUser.autoConfirmed')
                    : t('createAdminUser.verified')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('createAdminUser.password')} *</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={t('createAdminUser.passwordPlaceholder')}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('createAdminUser.confirmPassword')} *</Label>
            <Input
              id="confirmPassword"
              type="password"
              dir="ltr"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder={t('createAdminUser.confirmPasswordPlaceholder')}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
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
            disabled={
              isLoading ||
              (!formData.autoConfirmPhone && !otpVerified.phone) ||
              (!formData.autoConfirmEmail && !otpVerified.email)
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('createAdminUser.createAdminUser')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
