'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isPlatformAdmin, isPlatformOwner } from '@/lib/roles';
import { OtpType } from '@/constants/data';
import { useHumanCheck } from '@/hooks/use-human-check';
import { CreateAdminUserForm } from './create-admin-user-dialog/create-admin-user-form';
import { PlatformStaffRole } from './_lib/create-admin-user-dialog-helpers';

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAdminUserDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const showPlatformRoles = isPlatformAdmin(user);
  const canAssignAdmin = isPlatformOwner(user);
  const [platformRole, setPlatformRole] = useState<PlatformStaffRole>(
    canAssignAdmin ? 'ADMIN' : 'FINANCE',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+98',
    email: '',
    password: '',
    confirmPassword: '',
    autoConfirmEmail: false,
    autoConfirmPhone: false,
  });

  const [otpData, setOtpData] = useState({
    phoneOtp: '',
    emailOtp: '',
  });

  const [otpSent, setOtpSent] = useState({
    phone: false,
    email: false,
  });

  const [otpVerified, setOtpVerified] = useState({
    phone: false,
    email: false,
  });

  // The code-send routes need a solved captcha even for a logged-in admin.
  const captcha = useHumanCheck();
  const takeCaptchaToken = () => {
    const token = captcha.token;
    captcha.reset();
    return token;
  };

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
        OtpType.REGISTER_PHONE_VERIFICATION,
        takeCaptchaToken(),
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
        OtpType.REGISTER_EMAIL_VERIFICATION,
        takeCaptchaToken(),
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
        OtpType.REGISTER_PHONE_VERIFICATION,
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
        OtpType.REGISTER_EMAIL_VERIFICATION,
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

    // Only require OTP verification if auto-confirm is not enabled
    if (!formData.autoConfirmPhone && !otpVerified.phone) {
      ErrorHandler.showError(t('createAdminUser.pleaseVerifyPhoneOtp'));
      return;
    }

    if (!formData.autoConfirmEmail && !otpVerified.email) {
      ErrorHandler.showError(t('createAdminUser.pleaseVerifyEmailOtp'));
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
        phone_otp: formData.autoConfirmPhone ? '' : otpData.phoneOtp,
        email_otp: formData.autoConfirmEmail ? '' : otpData.emailOtp,
        auto_confirm_email: formData.autoConfirmEmail,
        auto_confirm_phone: formData.autoConfirmPhone,
        ...(showPlatformRoles ? { platform_role: platformRole } : {}),
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
      confirmPassword: '',
      autoConfirmEmail: false,
      autoConfirmPhone: false,
    });
    setOtpData({
      phoneOtp: '',
      emailOtp: '',
    });
    setOtpSent({ phone: false, email: false });
    setOtpVerified({ phone: false, email: false });
    setPlatformRole(canAssignAdmin ? 'ADMIN' : 'FINANCE');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <CreateAdminUserForm
        canAssignAdmin={canAssignAdmin}
        captcha={captcha}
        formData={formData}
        handleClose={handleClose}
        handleSendEmailOtp={handleSendEmailOtp}
        handleSendPhoneOtp={handleSendPhoneOtp}
        handleSubmit={handleSubmit}
        handleVerifyEmailOtp={handleVerifyEmailOtp}
        handleVerifyPhoneOtp={handleVerifyPhoneOtp}
        isLoading={isLoading}
        isSendingOtp={isSendingOtp}
        otpData={otpData}
        otpSent={otpSent}
        otpVerified={otpVerified}
        platformRole={platformRole}
        setFormData={setFormData}
        setOtpData={setOtpData}
        setPlatformRole={setPlatformRole}
        showPlatformRoles={showPlatformRoles}
      />
    </Dialog>
  );
}
