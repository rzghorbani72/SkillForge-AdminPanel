'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Save, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedDigitsInput } from '@/components/ui/localized-digits-input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { useAuthUser } from '@/components/providers/user-provider';
import { useSettingsData } from '../_hooks/use-settings-data';
import { AvatarUploader } from './_components/avatar-uploader';
import { PasswordCard } from './_components/password-card';
import { VerifiedContactField } from './_components/verified-contact-field';
import { useAvatarUpload } from './_hooks/use-avatar-upload';
import { useContactOtp } from './_hooks/use-contact-otp';
import { ProfileKycSection } from '@/components/settings/kyc/profile-kyc-section';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: ProfileForm = { name: '', email: '', phone: '' };

function initialsOf(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

export default function ProfileSettingsPage() {
  const { t, language } = useTranslation();
  const { user, isLoading, refresh } = useSettingsData();
  const { user: authUser, refetch: refetchAuthUser } = useAuthUser();
  const academy = useCurrentAcademy();
  const showKyc = authUser?.role === 'MANAGER' && Boolean(academy?.id);

  // The header avatar and name come from the auth provider, not this page's
  // fetch, so a save has to refresh both or the header stays stale.
  const refreshAll = useCallback(() => {
    refresh();
    void refetchAuthUser();
  }, [refresh, refetchAuthUser]);

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const displayName = user?.full_name ?? user?.display_name ?? '';
  const initials = useMemo(() => initialsOf(displayName), [displayName]);
  const savedAvatar = user?.avatar?.url ?? null;
  const roleName = user?.role_name ?? user?.profiles?.[0]?.role?.name;

  const avatar = useAvatarUpload(savedAvatar, refreshAll);
  const emailOtp = useContactOtp('email', form.email, refresh);
  const phoneOtp = useContactOtp('phone', form.phone, refresh);

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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('settings.profileSettingsTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('settings.profileSettingsSubtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </span>
            {t('settings.profileInformation')}
          </CardTitle>
          <CardDescription>{t('settings.profileInformationDescription')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AvatarUploader
            avatarUrl={avatar.avatarUrl}
            initials={initials}
            displayName={displayName}
            roleLabel={roleName ? getRoleLabel(roleName, t) : undefined}
            isUploading={avatar.isUploading}
            progress={avatar.progress}
            onFile={avatar.upload}
          />

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">{t('settings.fullName')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('settings.fullNamePlaceholder')}
                className="md:max-w-sm"
              />
            </div>

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
                  setForm({ ...form, email: e.target.value });
                  emailOtp.reset();
                }}
                placeholder={t('settings.emailPlaceholder')}
                className="flex-1"
              />
            </VerifiedContactField>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? t('settings.saving') : t('auth.logout')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !user} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileKycSection enabled={showKyc} />

      <PasswordCard />
    </div>
  );
}
