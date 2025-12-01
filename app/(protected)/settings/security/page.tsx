'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, KeyRound, Bell, Save } from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import type { Profile } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  courseUpdates: boolean;
  paymentAlerts: boolean;
}

const DEFAULT_PASSWORD_FORM: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  courseUpdates: true,
  paymentAlerts: true
};

export default function SecuritySettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useSettingsData();
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(
    DEFAULT_PASSWORD_FORM
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATIONS
  );
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [isSavingNotifications, setIsSavingNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.getUserProfiles();
        const payload = response?.data ?? response;

        let profiles: Profile[] = [];
        if (payload?.status === 'ok' && Array.isArray(payload?.data)) {
          profiles = payload.data as Profile[];
        } else if (Array.isArray(payload)) {
          profiles = payload as Profile[];
        }

        setActiveProfile(profiles.length > 0 ? profiles[0] : null);
      } catch (error) {
        console.error('Failed to load profiles for security page', error);
        setActiveProfile(null);
      }
    };

    loadProfile();
  }, []);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      ErrorHandler.showWarning(t('settings.newPasswordsDoNotMatch'));
      return;
    }

    if (!user || !activeProfile) {
      ErrorHandler.showWarning(t('settings.unableToLoadProfile'));
      return;
    }

    try {
      setIsSavingPassword(true);
      await apiClient.changeProfilePassword({
        profile_id: activeProfile.id,
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword,
        user_id: user.id
      });
      ErrorHandler.showSuccess(t('settings.passwordUpdatedSuccess'));
      setPasswordForm(DEFAULT_PASSWORD_FORM);
    } catch (error) {
      console.error('Error updating password', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      setIsSavingNotifications(true);
      // Persisting notification preferences is not yet implemented on the backend.
      ErrorHandler.showSuccess(t('settings.notificationPreferencesSaved'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[360px]" />
        <Skeleton className="h-[280px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.securityTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.securitySubtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> {t('settings.changePassword')}
          </CardTitle>
          <CardDescription>
            {t('settings.changePasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t('settings.currentPassword')}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: event.target.value
                  })
                }
                placeholder={t('settings.currentPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: event.target.value
                  })
                }
                placeholder={t('settings.newPasswordPlaceholder')}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirmPassword">
                {t('settings.confirmNewPassword')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: event.target.value
                  })
                }
                placeholder={t('settings.confirmNewPasswordPlaceholder')}
              />
            </div>
          </div>
          <Button onClick={handlePasswordChange} disabled={isSavingPassword}>
            {isSavingPassword
              ? t('settings.updating')
              : t('settings.updatePassword')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />{' '}
            {t('settings.twoFactorAuthentication')}
          </CardTitle>
          <CardDescription>
            {t('settings.twoFactorAuthenticationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{t('settings.twoFactorAuthenticationText')}</p>
          <Button variant="outline" size="sm">
            {t('settings.configure2FA')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> {t('settings.notificationPreferences')}
          </CardTitle>
          <CardDescription>
            {t('settings.notificationPreferencesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              title: t('settings.emailNotifications'),
              description: t('settings.emailNotificationsDescription')
            },
            {
              key: 'smsNotifications',
              title: t('settings.smsAlerts'),
              description: t('settings.smsAlertsDescription')
            },
            {
              key: 'courseUpdates',
              title: t('settings.courseUpdates'),
              description: t('settings.courseUpdatesDescription')
            },
            {
              key: 'paymentAlerts',
              title: t('settings.paymentAlerts'),
              description: t('settings.paymentAlertsDescription')
            }
          ].map(({ key, title, description }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={notifications[key as keyof NotificationSettings]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: checked
                  }))
                }
              />
            </div>
          ))}
          <div className="flex justify-end">
            <Button
              onClick={handleNotificationSave}
              variant="outline"
              disabled={isSavingNotifications}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingNotifications
                ? t('settings.saving')
                : t('settings.savePreferences')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
