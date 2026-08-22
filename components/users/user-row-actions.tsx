'use client';

import { useState, type ReactElement } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  Eye,
  KeyRound,
  Pencil,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { generateTempPassword } from '@/lib/password-utils';
import { cn } from '@/lib/utils';
import type { User } from '@/types/api';

const MANAGER_HIERARCHY_LEVEL = 3;

const iconBtnClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50';

const iconBtnDestructiveClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50';

type UserRowActionsProps = {
  user: User;
  targetLevel?: number | null;
  callerRole?: string;
  isSelf: boolean;
  onChanged: () => void;
  /** Show the profile link — used in table rows; hidden on the detail page header. */
  showDetailsLink?: boolean;
  /** Hide edit when the page already exposes it (e.g. user detail header). */
  showEditLink?: boolean;
  className?: string;
};

function ActionTooltip({
  label,
  children
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function UserRowActions({
  user,
  targetLevel,
  callerRole,
  isSelf,
  onChanged,
  showDetailsLink = false,
  showEditLink = true,
  className
}: UserRowActionsProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const canManage =
    callerRole === 'ADMIN' ||
    (callerRole === 'MANAGER' &&
      targetLevel != null &&
      targetLevel < MANAGER_HIERARCHY_LEVEL);

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
      <TooltipProvider delayDuration={200}>
        <div className={cn('flex items-center justify-end gap-0.5', className)}>
          {showDetailsLink && (
            <ActionTooltip label={t('stores.details')}>
              <Link
                href={`/user/${user.id}`}
                className={iconBtnClass}
                aria-label={t('stores.details')}
              >
                <Eye className="h-4 w-4" />
              </Link>
            </ActionTooltip>
          )}
          {showEditLink && (
            <ActionTooltip label={t('common.edit')}>
              <Link
                href={`/user/${user.id}/edit`}
                className={iconBtnClass}
                aria-label={t('common.edit')}
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </ActionTooltip>
          )}
          {canManage && (
            <>
              <ActionTooltip label={t('users.resetPassword')}>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={busy}
                  className={iconBtnClass}
                  aria-label={t('users.resetPassword')}
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </ActionTooltip>
              <ActionTooltip
                label={
                  user.is_active ? t('common.deactivate') : t('common.activate')
                }
              >
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={busy}
                  className={iconBtnClass}
                  aria-label={
                    user.is_active
                      ? t('common.deactivate')
                      : t('common.activate')
                  }
                >
                  {user.is_active ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </button>
              </ActionTooltip>
            </>
          )}
          {canManage && !isSelf && (
            <ActionTooltip label={t('common.delete')}>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className={iconBtnDestructiveClass}
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </ActionTooltip>
          )}
        </div>
      </TooltipProvider>

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
