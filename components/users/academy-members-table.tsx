'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { ReasonDialog } from '@/components/platform/reason-dialog';
import { ResetUserDialog } from '@/components/platform/reset-user-dialog';
import type { User } from '@/types/api';

export function AcademyMembersTable({
  rows,
  canModerate = false,
  onChanged
}: {
  rows: User[];
  canModerate?: boolean;
  onChanged?: () => void;
}) {
  const { t } = useTranslation();
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  const unban = async (row: User) => {
    if (!row.user_id) return;
    try {
      await apiClient.unbanUserPlatformWide(row.user_id);
      ErrorHandler.showSuccess(t('accountActions.unbanned_ok'));
      onChanged?.();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t('platformUsers.emptyAcademy')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('users.colFullName')}</TableHead>
            <TableHead>{t('users.colRole')}</TableHead>
            <TableHead>{t('platformUsers.academy')}</TableHead>
            <TableHead>{t('users.colPhone')}</TableHead>
            {canModerate && <TableHead className="w-[200px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  {row.display_name || row.full_name || t('users.unnamedUser')}
                  {row.user_banned_at && (
                    <Badge variant="destructive">
                      {t('accountActions.banned')}
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {row.role_label || row.role_name || '—'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.academy_name ?? t('users.platformFallback')}
              </TableCell>
              <TableCell dir="ltr" className="text-end tabular-nums">
                {row.phone_number || '—'}
              </TableCell>
              {canModerate && (
                <TableCell className="space-x-1 text-end">
                  {row.user_banned_at ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void unban(row)}
                    >
                      {t('accountActions.unban')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBanTarget(row)}
                    >
                      {t('accountActions.ban')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setResetTarget(row)}
                  >
                    {t('accountActions.reset')}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ReasonDialog
        open={banTarget !== null}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title={t('accountActions.banUserTitle')}
        description={t('accountActions.banUserDescription')}
        subject={banTarget?.display_name || banTarget?.full_name || ''}
        confirmLabel={t('accountActions.ban')}
        onConfirm={async (reason) => {
          if (!banTarget?.user_id) return;
          await apiClient.banUserPlatformWide(banTarget.user_id, reason);
          ErrorHandler.showSuccess(t('accountActions.banned_ok'));
        }}
        onDone={onChanged}
      />

      <ResetUserDialog
        open={resetTarget !== null}
        onOpenChange={(open) => !open && setResetTarget(null)}
        target={resetTarget}
        onDone={onChanged}
      />
    </div>
  );
}
