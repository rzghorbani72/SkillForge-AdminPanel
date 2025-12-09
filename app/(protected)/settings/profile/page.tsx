'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Upload, LogOut } from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';
import { authService } from '@/lib/auth';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
}

const DEFAULT_FORM: ProfileFormState = {
  name: '',
  email: '',
  phone: ''
};

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useSettingsData();
  const [form, setForm] = useState<ProfileFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setForm(DEFAULT_FORM);
      return;
    }
    console.log('user', user);

    setForm({
      name: user.display_name ?? '',
      email: user.email ?? '',
      phone: user.phone_number ?? ''
    });
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.display_name) return 'U';
    return user.display_name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user?.display_name]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await apiClient.updateUser(user.id, {
        name: form.name,
        email: form.email,
        phone_number: form.phone
      });
      ErrorHandler.showSuccess(t('settings.profileUpdatedSuccess'));
    } catch (error) {
      console.error('Error updating profile', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (error) {
      console.error('Error logging out', error);
      ErrorHandler.handleApiError(error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.profileSettingsTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.profileSettingsSubtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileInformation')}</CardTitle>
          <CardDescription>
            {t('settings.profileInformationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user?.display_name ?? ''} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" /> {t('settings.uploadPhoto')}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('settings.photoFormatHint')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('settings.fullName')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder={t('settings.fullNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder={t('settings.emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('settings.phoneNumber')}</Label>
              <Input
                id="phone"
                value={form.phone}
                dir="ltr"
                className="text-right"
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder={t('settings.phoneNumberPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? t('settings.saving') : t('auth.logout')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !user}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
