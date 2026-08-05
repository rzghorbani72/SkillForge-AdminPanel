'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, Bell, Save } from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  courseUpdates: boolean;
  paymentAlerts: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  courseUpdates: true,
  paymentAlerts: true
};

export default function SecuritySettingsPage() {
  const { t } = useTranslation();
  const { isLoading } = useSettingsData();
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATIONS
  );
  const [isSavingNotifications, setIsSavingNotifications] =
    useState<boolean>(false);

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
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:bg-card"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-3" dir="rtl">
                <span className=" text-right text-xs font-medium text-muted-foreground">
                  {notifications[key as keyof NotificationSettings]
                    ? t('common.enabled')
                    : t('common.disabled')}
                </span>
                <Switch
                  checked={notifications[key as keyof NotificationSettings]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: checked
                    }))
                  }
                  className="h-6 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-muted"
                />
              </div>
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
