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
import { defaultAssignableRole } from '@/lib/assignable-roles';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { usePersonLookup } from './use-person-lookup';

type AssignableRole = { name: string; label: string; hierarchy_level: number };

/** A number worth asking the server about — see README for why phone comes first. */
const COMPLETE_PHONE = /^\+\d{11,15}$/;

const EMPTY_FORM = {
  displayName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
};

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Add someone to this academy, phone number first.
 *
 * The number identifies the person, not an account: a phone already on the
 * platform gains a role here rather than being rejected as "taken", which is
 * why there is no separate "add existing member" dialog.
 */
export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess
}: AddUserDialogProps) {
  const { t } = useTranslation();

  const [roleOptions, setRoleOptions] = useState<AssignableRole[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { result, isSearching, search, reset: resetLookup } = usePersonLookup();

  // The server decides which roles are valid — every role below the caller's
  // rank, students included. A student cannot sign in to this panel; they sign
  // in to the academy site, and the one-time password set here forces them to
  // choose their own on that first login.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setRolesLoading(true);
    apiClient
      .getAssignableAcademyRoles()
      .then(({ roles }) => {
        if (!active) return;
        setRoleOptions(roles);
        setForm((f) => ({
          ...f,
          role: f.role || (defaultAssignableRole(roles) ?? '')
        }));
      })
      .catch((e) => ErrorHandler.handleApiError(e))
      .finally(() => active && setRolesLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  // Typing the number is the search: no button, no blur required. Only a
  // complete number is sent, so partial input never hits the API.
  const debouncedPhone = useDebouncedValue(form.phone, 500);
  const lookupPhone = toE164Iran(debouncedPhone);
  const isPhoneComplete = COMPLETE_PHONE.test(lookupPhone);

  useEffect(() => {
    if (!open) return;
    if (!isPhoneComplete) {
      resetLookup();
      return;
    }
    void search(lookupPhone);
  }, [open, isPhoneComplete, lookupPhone, search, resetLookup]);

  const isKnownPerson = result?.found === true;
  const alreadyMember = !!result?.membership;
  /** An unknown number means we are creating the account, so details are required. */
  const needsAccount = result !== null && !isKnownPerson;
  const showDetails = result !== null && !alreadyMember;

  const isPasswordReady = isPasswordValid(form.password);
  const isConfirmReady =
    form.password === form.confirmPassword && form.confirmPassword.length > 0;
  // A new person needs something to sign in with; an existing account already
  // has a password, so setting one here is optional.
  const isPasswordStepValid = needsAccount
    ? isPasswordReady && isConfirmReady
    : form.password.length === 0 || (isPasswordReady && isConfirmReady);
  const isNameReady = !needsAccount || form.displayName.trim().length > 1;
  const isFormValid =
    showDetails && !!form.role && isNameReady && isPasswordStepValid;

  // Rank 1 and below is a learner, not staff — see SYSTEM_ROLE_DEFINITIONS.
  const isStudentRank =
    (roleOptions.find((role) => role.name === form.role)?.hierarchy_level ??
      99) <= 1;

  function reset() {
    setForm({
      ...EMPTY_FORM,
      role: defaultAssignableRole(roleOptions) ?? ''
    });
    resetLookup();
    setCopied(false);
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
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
    if (!isFormValid || loading) return;

    try {
      setLoading(true);
      // One endpoint for both outcomes: it attaches a role to an existing
      // account, or creates the account when the number is unknown.
      await apiClient.addAcademyMember({
        phone_number: lookupPhone,
        role: form.role,
        name: needsAccount ? form.displayName.trim() : undefined,
        email: needsAccount ? form.email.trim() || undefined : undefined,
        password: form.password || undefined
      });

      ErrorHandler.showSuccess(t('members.memberAdded'));
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
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('users.addUserTitle')}</DialogTitle>
          <DialogDescription>
            {t('members.addMemberDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <PhoneInput
              id="phone"
              label={`${t('auth.phoneNumber')} *`}
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              disabled={loading}
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isSearching && <Loader2 className="h-3 w-3 animate-spin" />}
              {t('members.phoneHint')}
            </p>
          </div>

          {alreadyMember && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[12px] text-amber-700 dark:text-amber-400">
              {t('members.alreadyMember')}
            </p>
          )}

          {showDetails && (
            <>
              {isKnownPerson ? (
                <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-[12px] text-emerald-700 dark:text-emerald-400">
                  {t('members.personFound')}
                  {result?.name ? ` — ${result.name}` : ''}
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {t('members.personNotFound')}
                  </p>
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">
                      {t('users.displayName')} *
                    </Label>
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
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('students.studentEmail')}</Label>
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {roleOptions.length > 1 && (
                <div className="space-y-1.5">
                  <Label>{t('members.roleInAcademy')}</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                    disabled={loading || rolesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
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
                {form.password && <PasswordStrength password={form.password} />}
              </div>

              {form.password && (
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
                      setForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value
                      }))
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
              )}

              <p className="rounded-lg bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
                {t('members.smsNotice')}
              </p>

              {isStudentRank && (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
                  {t('users.studentSignsInOnSiteNote')}
                </p>
              )}
            </>
          )}

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
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('users.addUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
