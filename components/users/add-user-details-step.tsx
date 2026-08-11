'use client';

import { useState } from 'react';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PasswordStrength } from '@/components/ui/password-strength';
import { generateTempPassword } from '@/lib/password-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { AddUserForm, AssignableRole } from './add-user-form';

interface AddUserDetailsStepProps {
  form: AddUserForm;
  patch: (changes: Partial<AddUserForm>) => void;
  /** Unknown number: we are creating the account, so name and password matter. */
  needsAccount: boolean;
  phone: string;
  personName: string | null | undefined;
  roleOptions: AssignableRole[];
  rolesLoading: boolean;
  loading: boolean;
  isConfirmReady: boolean;
  isStudentRank: boolean;
  canSubmit: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

/**
 * Step two: everything else, in two columns so the panel never needs a
 * scrollbar — a dialog that scrolls hides half its own form.
 */
export function AddUserDetailsStep({
  form,
  patch,
  needsAccount,
  phone,
  personName,
  roleOptions,
  rolesLoading,
  loading,
  isConfirmReady,
  isStudentRank,
  canSubmit,
  onBack,
  onCancel,
  onSubmit
}: AddUserDetailsStepProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleCopyPassword() {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGeneratePassword() {
    const generated = generateTempPassword();
    patch({ password: generated, confirmPassword: generated });
    setCopied(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <div className="min-w-0">
          <div dir="ltr" className="truncate text-[13px] font-semibold">
            {phone}
          </div>
          <div className="truncate text-[11.5px] text-muted-foreground">
            {personName
              ? `${t('members.personFound')} — ${personName}`
              : t('members.personNotFound')}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={loading}
        >
          {t('common.back')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {needsAccount && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="displayName">{t('users.displayName')} *</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => patch({ displayName: e.target.value })}
                placeholder={t('users.displayNamePlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('students.studentEmail')}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">
              {needsAccount
                ? `${t('students.oneTimePassword')} *`
                : t('members.optionalPassword')}
            </Label>
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
                patch({ password: e.target.value });
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
          {form.password && <PasswordStrength password={form.password} />}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">
            {t('auth.confirmPassword')}
            {needsAccount ? ' *' : ''}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            dir="ltr"
            value={form.confirmPassword}
            onChange={(e) => patch({ confirmPassword: e.target.value })}
            placeholder="••••••••"
            disabled={loading || !form.password}
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t('members.roleInAcademy')}</Label>
            <Select
              value={form.role}
              onValueChange={(role) => patch({ role })}
              disabled={loading || rolesLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.name} value={role.name}>
                    {getRoleLabel(role.name, t) === role.name
                      ? role.label
                      : getRoleLabel(role.name, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <p className="rounded-lg bg-muted/50 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        {t('members.smsNotice')}
        {isStudentRank ? ` ${t('users.studentSignsInOnSiteNote')}` : ''}
      </p>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {t('users.addUser')}
        </Button>
      </DialogFooter>
    </form>
  );
}
