'use client';

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
import type { PlatformStaffRecord, User } from '@/types/api';

export function PlatformStaffTable({
  rows,
  roleLabel,
  canManage,
  currentUserId,
  isOwner,
  onChanged
}: {
  rows: PlatformStaffRecord[];
  roleLabel: Record<string, string>;
  canManage: boolean;
  currentUserId: string;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const { t } = useTranslation();

  const canModify = (row: PlatformStaffRecord) => {
    if (!canManage) return false;
    if (row.id === currentUserId) return false;
    if (row.platform_role === 'PLATFORM_OWNER') return false;
    if (row.platform_role === 'ADMIN' && !isOwner) return false;
    return true;
  };

  const toggleActive = async (row: PlatformStaffRecord) => {
    if (!canModify(row)) return;
    try {
      await apiClient.updatePlatformStaff(row.id, {
        is_active: !row.is_active,
        reason: row.is_active
          ? 'Deactivated from users hub'
          : 'Reactivated from users hub'
      });
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t('platformUsers.emptyStaff')}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admins.name')}</TableHead>
            <TableHead>{t('admins.platformRole')}</TableHead>
            <TableHead>{t('admins.email')}</TableHead>
            <TableHead>{t('admins.status')}</TableHead>
            {canManage && <TableHead className="w-[120px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.display_name || row.full_name || '—'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {roleLabel[row.platform_role] ?? row.platform_role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.email ?? '—'}
              </TableCell>
              <TableCell>
                <Badge variant={row.is_active ? 'default' : 'outline'}>
                  {row.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </TableCell>
              {canManage && (
                <TableCell>
                  {canModify(row) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void toggleActive(row)}
                    >
                      {row.is_active
                        ? t('common.deactivate')
                        : t('common.activate')}
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AcademyMembersTable({ rows }: { rows: User[] }) {
  const { t } = useTranslation();

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.display_name || row.full_name || t('users.unnamedUser')}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
