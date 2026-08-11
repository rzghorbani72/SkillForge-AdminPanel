'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { isPasswordValid } from '@/components/ui/password-strength';
import { toE164Iran } from '@/lib/phone-utils';
import { defaultAssignableRole } from '@/lib/assignable-roles';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePersonLookup } from './use-person-lookup';
import { AddUserLookupStep } from './add-user-lookup-step';
import { AddUserDetailsStep } from './add-user-details-step';
import {
  COMPLETE_PHONE,
  EMPTY_ADD_USER_FORM,
  isStudentRankRole,
  type AddUserForm,
  type AssignableRole
} from './add-user-form';

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
 *
 * Two deliberate steps. The lookup answering is not a reason to throw the whole
 * form at the reader, so step two opens on a click and the panel grows with it.
 */
export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess
}: AddUserDialogProps) {
  const { t } = useTranslation();

  const [roleOptions, setRoleOptions] = useState<AssignableRole[]>([]);
  const [form, setForm] = useState<AddUserForm>(EMPTY_ADD_USER_FORM);
  const [onDetails, setOnDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { result, isSearching, search, reset: resetLookup } = usePersonLookup();

  const patch = (changes: Partial<AddUserForm>) =>
    setForm((current) => ({ ...current, ...changes }));

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

  const needsAccount = result !== null && !result.found;
  const canContinue = result !== null && !result.membership && !isSearching;

  const isConfirmReady =
    form.password === form.confirmPassword && form.confirmPassword.length > 0;
  // A new person needs something to sign in with; an existing account already
  // has a password, so setting one here is optional.
  const isPasswordStepValid = needsAccount
    ? isPasswordValid(form.password) && isConfirmReady
    : form.password.length === 0 ||
      (isPasswordValid(form.password) && isConfirmReady);
  const isNameReady = !needsAccount || form.displayName.trim().length > 1;
  const canSubmit =
    canContinue && !!form.role && isNameReady && isPasswordStepValid;

  function handleClose(next: boolean) {
    if (!next) {
      setForm({
        ...EMPTY_ADD_USER_FORM,
        role: defaultAssignableRole(roleOptions) ?? ''
      });
      resetLookup();
      setOnDetails(false);
    }
    onOpenChange(next);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;

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
      {/* Step two carries twice the fields, so the panel widens instead of
          growing a scrollbar. */}
      <DialogContent className={onDetails ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>{t('users.addUserTitle')}</DialogTitle>
          <DialogDescription>
            {onDetails
              ? t('members.addMemberDescription')
              : t('members.phoneHint')}
          </DialogDescription>
        </DialogHeader>

        {onDetails ? (
          <AddUserDetailsStep
            form={form}
            patch={patch}
            needsAccount={needsAccount}
            phone={lookupPhone}
            personName={result?.found ? result.name : null}
            roleOptions={roleOptions}
            rolesLoading={rolesLoading}
            loading={loading}
            isConfirmReady={isConfirmReady}
            isStudentRank={isStudentRankRole(roleOptions, form.role)}
            canSubmit={canSubmit}
            onBack={() => setOnDetails(false)}
            onCancel={() => handleClose(false)}
            onSubmit={handleSubmit}
          />
        ) : (
          <AddUserLookupStep
            phone={form.phone}
            onPhoneChange={(phone) => patch({ phone })}
            isSearching={isSearching}
            result={result}
            canContinue={canContinue}
            onNext={() => setOnDetails(true)}
            onCancel={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
