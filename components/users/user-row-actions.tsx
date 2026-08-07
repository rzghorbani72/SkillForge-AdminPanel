'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { generateTempPassword } from '@/lib/password-utils';
import type { User } from '@/types/api';

// Mirrors the server-side scope in UsersService.update/remove/resetUserPassword —
// a manager may only manage students/teachers in their own academy.
const MANAGER_SCOPED_ROLES = ['STUDENT', 'TEACHER'];

type UserRowActionsProps = {
  user: User;
  targetRoleId?: string;
  callerRole?: string;
  isSelf: boolean;
  onChanged: () => void;
};

export function UserRowActions({
  user,
  targetRoleId,
  callerRole,
  isSelf,
  onChanged
}: UserRowActionsProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const canManage =
    callerRole === 'ADMIN' ||
    (callerRole === 'MANAGER' &&
      MANAGER_SCOPED_ROLES.includes(targetRoleId ?? ''));

  async function handleToggleActive() {
    setBusy(true);
    try {
      await apiClient.updateUser(user.id, { is_active: !user.is_active });
      onChanged();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    const generated = generateTempPassword();
    setBusy(true);
    try {
      await apiClient.resetUserPassword(user.id, generated);
      setNewPassword(generated);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await apiClient.deleteUser(user.id);
      ErrorHandler.showSuccess(t('users.userDeleted'));
      setConfirmDelete(false);
      onChanged();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyPassword() {
    if (!newPassword) return;
    await navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-50"
            disabled={busy}
          >
            <MoreHorizontal style={{ width: 14, height: 14 }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/user/${user.id}/edit`}>
              <Pencil className="me-2 h-3.5 w-3.5" />
              {t('common.edit')}
            </Link>
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuItem onClick={handleResetPassword} disabled={busy}>
                <KeyRound className="me-2 h-3.5 w-3.5" />
                {t('users.resetPassword')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive} disabled={busy}>
                {user.is_active ? (
                  <Ban className="me-2 h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="me-2 h-3.5 w-3.5" />
                )}
                {user.is_active ? t('common.deactivate') : t('common.activate')}
              </DropdownMenuItem>
            </>
          )}
          {canManage && !isSelf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="me-2 h-3.5 w-3.5" />
                {t('common.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.deleteUserTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.confirmDeleteUser', {
                name: user.display_name || user.name || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!newPassword}
        onOpenChange={(open) => !open && setNewPassword(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('users.newPasswordTitle')}</DialogTitle>
            <DialogDescription>
              {t('users.newPasswordDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="relative" dir="ltr">
            <div className="flex h-10 items-center rounded-lg border border-border bg-muted/40 px-3 pe-9 font-mono text-[15px] tracking-wide">
              {newPassword}
            </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
