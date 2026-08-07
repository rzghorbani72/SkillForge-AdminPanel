'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  PasswordStrength,
  isPasswordValid
} from '@/components/ui/password-strength';
import { toE164Iran } from '@/lib/phone-utils';
import { generateTempPassword } from '@/lib/password-utils';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { useAuthUser } from '@/hooks/useAuthUser';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';

type AssignableRole = { name: string; label: string; hierarchy_level: number };

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess
}: AddUserDialogProps) {
  const { t } = useTranslation();
  const { user: authUser } = useAuthUser();

  const [roleOptions, setRoleOptions] = useState<AssignableRole[]>([]);
  const academyId = authUser?.academyId ?? null;

  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // The server decides which roles are valid here: this panel is staff-only, so
  // offering a student-rank role would create an account that can never sign in.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setRolesLoading(true);
    apiClient
      .getAssignableRoles()
      .then(({ roles }) => {
        if (!active) return;
        setRoleOptions(roles);
        setForm((f) => ({ ...f, role: f.role || (roles[0]?.name ?? '') }));
      })
      .catch((e) => ErrorHandler.handleApiError(e))
      .finally(() => active && setRolesLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  // Derived validity — drives the submit button
  const phoneE164 = toE164Iran(form.phone);
  const isPhoneReady =
    form.phone.length > 0 && phoneE164.startsWith('+') && !phoneError;
  const isPasswordReady = isPasswordValid(form.password);
  const isConfirmReady =
    form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const isNameReady = form.displayName.trim().length > 0;
  const isFormValid =
    isNameReady &&
    isPhoneReady &&
    isPasswordReady &&
    isConfirmReady &&
    !!form.role;

  function reset() {
    setForm({
      displayName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: roleOptions[0]?.name ?? ''
    });
    setPhoneError(null);
  }

  async function handlePhoneBlur() {
    if (!form.phone) return;
    const e164 = toE164Iran(form.phone);
    if (!e164.startsWith('+')) {
      setPhoneError(t('auth.validPhoneNumber'));
      return;
    }
    try {
      const res = await fetch(
        `${getBrowserApiBaseUrl()}/affiliates/check-phone?phone=${encodeURIComponent(e164)}`,
        { credentials: 'include' }
      );
      if (!res.ok) return;
      const body = await res.json();
      const data = body?.data ?? body;
      if (data?.exists) setPhoneError(t('users.phoneAlreadyRegistered'));
    } catch {
      // non-critical
    }
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  function handleGeneratePassword() {
    const generated = generateTempPassword();
    setForm((f) => ({
      ...f,
      password: generated,
      confirmPassword: generated
    }));
    setCopied(false);
  }

  async function handleCopyPassword() {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);
      await apiClient.createUser({
        name: form.displayName,
        display_name: form.displayName,
        phone_number: toE164Iran(form.phone),
        password: form.password,
        role: form.role,
        academy_id: academyId!
      });

      ErrorHandler.showSuccess(t('users.userAddedSuccess'));
      handleClose(false);
      onSuccess?.();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.addUserTitle')}</DialogTitle>
          <DialogDescription>{t('users.addUserDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{t('users.displayName')} *</Label>
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayName: e.target.value }))
              }
              placeholder={t('users.displayNamePlaceholder')}
              disabled={loading}
            />
          </div>

          <PhoneInput
            id="phone"
            label={`${t('auth.phoneNumber')} *`}
            value={form.phone}
            onChange={(v) => {
              setForm((f) => ({ ...f, phone: v }));
              setPhoneError(null);
            }}
            onBlur={handlePhoneBlur}
            error={phoneError ?? undefined}
            disabled={loading}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.password')} *</Label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                {t('users.generatePassword')}
              </button>
            </div>
            <div className="relative" dir="ltr">
              <Input
                id="password"
                type="text"
                dir="ltr"
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  setCopied(false);
                }}
                placeholder="••••••••"
                disabled={loading}
                className="pe-9"
              />
              {form.password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title={t('common.copy')}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <PasswordStrength password={form.password} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">
              {t('auth.confirmPassword')} *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              dir="ltr"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              placeholder="••••••••"
              disabled={loading}
              className={
                form.confirmPassword && !isConfirmReady
                  ? 'border-destructive'
                  : undefined
              }
            />
            {form.confirmPassword && !isConfirmReady && (
              <p className="text-xs text-destructive">
                {t('auth.passwordsDoNotMatch')}
              </p>
            )}
          </div>

          {roleOptions.length > 1 && (
            <div className="space-y-1.5">
              <Label>{t('users.selectRole')}</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                disabled={loading || rolesLoading}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {roleOptions.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {getRoleLabel(r.name, t) === r.name
                        ? r.label
                        : getRoleLabel(r.name, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="rounded-lg bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
            {t('users.unconfirmedNote')}
          </p>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('users.addUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
