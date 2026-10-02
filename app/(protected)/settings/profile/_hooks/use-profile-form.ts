import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { User } from '@/types/api';
import type { ProfileForm } from '../_components/contact-fields';
import { useContactOtp } from './use-contact-otp';

const EMPTY_FORM: ProfileForm = { name: '', email: '', phone: '' };

export function useProfileForm(user: User | null, refreshUser: () => void, refreshAll: () => void) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const emailOtp = useContactOtp('email', form.email, refreshUser);
  const phoneOtp = useContactOtp('phone', form.phone, refreshUser);

  useEffect(() => {
    setForm(
      user
        ? {
            name: user.full_name ?? user.display_name ?? '',
            email: user.email ?? '',
            phone: user.phone_number ?? '',
          }
        : EMPTY_FORM,
    );
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await apiClient.updateMe({ full_name: form.name });
      ErrorHandler.showSuccess(t('settings.profileUpdatedSuccess'));
      refreshAll();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }, [form.name, refreshAll, t, user]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setIsLoggingOut(false);
    }
  }, []);

  return { form, setForm, isSaving, isLoggingOut, handleSave, handleLogout, emailOtp, phoneOtp };
}
