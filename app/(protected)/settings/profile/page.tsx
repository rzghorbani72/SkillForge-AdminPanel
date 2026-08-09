'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Camera,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  KeyRound
} from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { authService } from '@/lib/auth';
import { OtpType } from '@/constants/data';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
}

const DEFAULT_FORM: ProfileFormState = { name: '', email: '', phone: '' };

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const DEFAULT_PASSWORD_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

type OtpStep = 'idle' | 'sending' | 'input' | 'verifying';

interface OtpState {
  step: OtpStep;
  code: string;
}

const DEFAULT_OTP: OtpState = { step: 'idle', code: '' };

// ── inline OTP panel ──────────────────────────────────────────────────────────
interface OtpPanelProps {
  state: OtpState;
  sentTo: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
  t: (key: string) => string;
}

function OtpPanel({
  state,
  sentTo,
  onCodeChange,
  onVerify,
  onResend,
  t
}: OtpPanelProps) {
  if (state.step === 'idle') return null;

  return (
    <div className="mt-2 space-y-2 rounded-lg border bg-muted/40 p-3">
      {state.step === 'sending' ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('settings.sendingCode')}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {t('settings.codeSentTo').replace('{{value}}', sentTo)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              dir="ltr"
              value={state.code}
              onChange={(e) =>
                onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder={t('settings.otpPlaceholder')}
              className="w-36 text-center font-mono text-base tracking-[0.4em]"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && state.code.length >= 4) onVerify();
              }}
            />
            <Button
              size="sm"
              onClick={onVerify}
              disabled={state.code.length < 4 || state.step === 'verifying'}
            >
              {state.step === 'verifying' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('settings.verifyCode')
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResend}
              disabled={state.step === 'verifying'}
            >
              {t('settings.resendCode')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, isLoading, refresh } = useSettingsData();

  const [form, setForm] = useState<ProfileFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [emailOtp, setEmailOtp] = useState<OtpState>(DEFAULT_OTP);
  const [phoneOtp, setPhoneOtp] = useState<OtpState>(DEFAULT_OTP);

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(
    DEFAULT_PASSWORD_FORM
  );
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      setForm(DEFAULT_FORM);
      return;
    }
    setForm({
      name: user.full_name ?? user.display_name ?? '',
      email: user.email ?? '',
      phone: user.phone_number ?? ''
    });
    const avatar = user.profiles?.[0]?.avatar?.publicUrl;
    if (avatar) setAvatarUrl(avatar);
  }, [user]);

  const displayName = user?.full_name ?? user?.display_name ?? '';

  const initials = useMemo(() => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName]);

  // ── avatar ─────────────────────────────────────────────────────────────────
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      setAvatarUrl(URL.createObjectURL(file));
      const uploaded = await apiClient.uploadImage(file, { title: 'Avatar' });
      if (uploaded?.publicUrl) setAvatarUrl(uploaded.publicUrl);
      if (uploaded?.id)
        await apiClient
          .updateProfile({ avatar_id: uploaded.id })
          .catch(() => {});
      ErrorHandler.showSuccess(t('settings.photoUpdatedSuccess'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setAvatarUrl(user?.profiles?.[0]?.avatar?.publicUrl ?? null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── save name ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await apiClient.updateMe({ full_name: form.name });
      ErrorHandler.showSuccess(t('settings.profileUpdatedSuccess'));
      refresh();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      ErrorHandler.showWarning(t('settings.newPasswordsDoNotMatch'));
      return;
    }
    try {
      setIsSavingPassword(true);
      await apiClient.changeProfilePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword
      });
      ErrorHandler.showSuccess(t('settings.passwordUpdatedSuccess'));
      setPasswordForm(DEFAULT_PASSWORD_FORM);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setIsLoggingOut(false);
    }
  };

  // ── email OTP ──────────────────────────────────────────────────────────────
  const sendEmailOtp = async () => {
    if (!form.email) return;
    try {
      setEmailOtp({ step: 'sending', code: '' });
      await apiClient.sendEmailOtp(
        form.email,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      setEmailOtp((s) => ({ ...s, step: 'input' }));
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setEmailOtp(DEFAULT_OTP);
    }
  };

  const verifyEmailOtp = async () => {
    if (!form.email || !emailOtp.code) return;
    try {
      setEmailOtp((s) => ({ ...s, step: 'verifying' }));
      await apiClient.verifyEmailOtp(
        form.email,
        emailOtp.code,
        OtpType.REGISTER_EMAIL_VERIFICATION
      );
      ErrorHandler.showSuccess(t('settings.emailVerifiedSuccess'));
      setEmailOtp(DEFAULT_OTP);
      refresh();
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setEmailOtp((s) => ({ ...s, step: 'input' }));
    }
  };

  // ── phone OTP ──────────────────────────────────────────────────────────────
  const sendPhoneOtp = async () => {
    if (!form.phone) return;
    try {
      setPhoneOtp({ step: 'sending', code: '' });
      await apiClient.sendPhoneOtp(
        form.phone,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      setPhoneOtp((s) => ({ ...s, step: 'input' }));
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setPhoneOtp(DEFAULT_OTP);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!form.phone || !phoneOtp.code) return;
    try {
      setPhoneOtp((s) => ({ ...s, step: 'verifying' }));
      await apiClient.verifyPhoneOtp(
        form.phone,
        phoneOtp.code,
        OtpType.REGISTER_PHONE_VERIFICATION
      );
      ErrorHandler.showSuccess(t('settings.phoneVerifiedSuccess'));
      setPhoneOtp(DEFAULT_OTP);
      refresh();
    } catch (err) {
      ErrorHandler.handleApiError(err);
      setPhoneOtp((s) => ({ ...s, step: 'input' }));
    }
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  const isEmailConfirmed = user?.email_confirmed === true;
  const isPhoneConfirmed = user?.phone_confirmed === true;
  const isEmailDirty = form.email !== (user?.email ?? '');
  const isPhoneDirty = form.phone !== (user?.phone_number ?? '');

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
          {/* Avatar + display name */}
          <div className="flex items-center gap-5">
            <div className="group relative shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl ?? ''} alt={displayName} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity disabled:cursor-not-allowed group-hover:opacity-100"
                aria-label={t('settings.uploadPhoto')}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-xl font-semibold leading-none">
                  {displayName || t('settings.fullNamePlaceholder')}
                </p>
                {(user as any)?.role && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {getRoleLabel((user as any).role, t)}
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.uploadingPhoto')}
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    {avatarUrl
                      ? t('settings.changePhoto')
                      : t('settings.uploadPhoto')}
                  </>
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              title={t('settings.uploadPhoto')}
              aria-label={t('settings.uploadPhoto')}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                e.target.value = '';
              }}
            />
          </div>

          {/* Full name (edit) */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('settings.fullName')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('settings.fullNamePlaceholder')}
              className="max-w-sm"
            />
          </div>

          {/* Phone + Email — one row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="phone">{t('settings.phoneNumber')}</Label>
                {!isPhoneDirty &&
                  (isPhoneConfirmed ? (
                    <Badge className="gap-1 bg-green-500 px-2 py-0.5 text-xs text-white hover:bg-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('settings.phoneVerified')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-400 px-2 py-0.5 text-xs text-amber-600"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {t('settings.phoneNotVerified')}
                    </Badge>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (phoneOtp.step !== 'idle') setPhoneOtp(DEFAULT_OTP);
                  }}
                  placeholder={t('settings.phoneNumberPlaceholder')}
                  className="flex-1"
                />
                {!isPhoneConfirmed &&
                  !isPhoneDirty &&
                  form.phone &&
                  phoneOtp.step === 'idle' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendPhoneOtp}
                      className="shrink-0"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {t('settings.verifyPhone')}
                    </Button>
                  )}
              </div>
              <OtpPanel
                state={phoneOtp}
                sentTo={form.phone}
                onCodeChange={(code) => setPhoneOtp((s) => ({ ...s, code }))}
                onVerify={verifyPhoneOtp}
                onResend={sendPhoneOtp}
                t={t}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="email">{t('settings.email')}</Label>
                {!isEmailDirty &&
                  (isEmailConfirmed ? (
                    <Badge className="gap-1 bg-green-500 px-2 py-0.5 text-xs text-white hover:bg-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('settings.emailVerified')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-400 px-2 py-0.5 text-xs text-amber-600"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {t('settings.emailNotVerified')}
                    </Badge>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (emailOtp.step !== 'idle') setEmailOtp(DEFAULT_OTP);
                  }}
                  placeholder={t('settings.emailPlaceholder')}
                  className="flex-1"
                />
                {!isEmailConfirmed &&
                  !isEmailDirty &&
                  form.email &&
                  emailOtp.step === 'idle' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendEmailOtp}
                      className="shrink-0"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t('settings.verifyEmail')}
                    </Button>
                  )}
              </div>
              <OtpPanel
                state={emailOtp}
                sentTo={form.email}
                onCodeChange={(code) => setEmailOtp((s) => ({ ...s, code }))}
                onVerify={verifyEmailOtp}
                onResend={sendEmailOtp}
                t={t}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
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
                dir="ltr"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
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
                dir="ltr"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
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
                dir="ltr"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
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
    </div>
  );
}
