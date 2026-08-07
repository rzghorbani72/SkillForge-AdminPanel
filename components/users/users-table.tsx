'use client';

import { BookOpen, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { UserAvatar, toneToHsl } from './user-avatar';
import { UserStatusPill } from './user-status-pill';
import { UserRoleBadge, type RoleConfig } from './user-role-badge';
import { UserRowActions } from './user-row-actions';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { User } from '@/types/api';

type UserRowProps = {
  user: User;
  tone: number;
  roles: RoleConfig[];
  currentRoleId?: string;
  onRoleClick: () => void;
  onCourseAccess: (user: User) => void;
  callerRole?: string;
  callerId?: number;
  onChanged: () => void;
};

function UserRow({
  user,
  tone,
  roles,
  currentRoleId,
  onRoleClick,
  onCourseAccess,
  callerRole,
  callerId,
  onChanged
}: UserRowProps) {
  const { t } = useTranslation();
  const roleConfig = roles.find((r) => r.id === currentRoleId);
  const roleTone = roleConfig?.tone ?? tone;
  // Same rule as the roles page: a built-in role uses its translation, and a
  // custom one (no translation key) falls back to its creator-typed label.
  const translatedRole = getRoleLabel(currentRoleId, t);
  const roleLabel =
    currentRoleId && translatedRole === currentRoleId
      ? user.role_label || currentRoleId
      : translatedRole;
  const displayName = user.display_name || user.name;

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <input type="checkbox" className="rounded border-border" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={displayName} tone={roleTone} size={32} />
          <div>
            <div className="text-[13.5px] font-semibold leading-tight">
              {displayName || t('users.userWithId', { id: user.id })}
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              {user.email || '—'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <UserRoleBadge role={roleLabel} tone={roleTone} onClick={onRoleClick} />
      </td>
      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
        {user.phone_number || '—'}
      </td>
      <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground">
        {user.created_at
          ? new Date(user.created_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <UserStatusPill
          status={user.status || (user.is_active ? 'active' : 'inactive')}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60"
            title={t('users.courses')}
            onClick={() => onCourseAccess(user)}
          >
            <BookOpen style={{ width: 14, height: 14 }} />
          </button>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60"
            title={t('users.sendMessage')}
          >
            <Mail style={{ width: 13, height: 13 }} />
          </button>
          <UserRowActions
            user={user}
            targetRoleId={currentRoleId}
            callerRole={callerRole}
            isSelf={!!callerId && String(callerId) === String(user.id)}
            onChanged={onChanged}
          />
        </div>
      </td>
    </tr>
  );
}

type UsersTableProps = {
  users: User[];
  roles: RoleConfig[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onRoleClick: () => void;
  onCourseAccess: (user: User) => void;
  callerRole?: string;
  callerId?: number;
  onChanged: () => void;
};

export function UsersTable({
  users,
  roles,
  totalCount,
  page,
  onPageChange,
  onRoleClick,
  onCourseAccess,
  callerRole,
  callerId,
  onChanged
}: UsersTableProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalCount / 20);

  // The list endpoints disagree on shape: /users returns a flat role_name,
  // while /users/{students,teachers,managers} nest it under profiles[0].
  function getUserRoleId(user: User): string | undefined {
    const profile = user.profiles?.[0];
    return (
      profile?.role?.name ?? profile?.Role?.name ?? user.role_name ?? undefined
    );
  }

  function getUserTone(user: User, index: number): number {
    const roleId = getUserRoleId(user);
    const roleConfig = roles.find((r) => r.id === roleId);
    return roleConfig?.tone ?? (22 + index * 47) % 360;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="w-8 px-4 py-3 text-start">
              <input type="checkbox" className="rounded border-border" />
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('common.name')}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('userEdit.role')}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('common.phone')}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('users.joinDate')}
            </th>
            <th className="px-4 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t('common.status')}
            </th>
            <th className="w-24 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                {t('users.noUsersFound')}
              </td>
            </tr>
          ) : (
            users.map((u, i) => (
              <UserRow
                key={u.id}
                user={u}
                tone={getUserTone(u, i)}
                roles={roles}
                currentRoleId={getUserRoleId(u)}
                onRoleClick={onRoleClick}
                onCourseAccess={onCourseAccess}
                callerRole={callerRole}
                callerId={callerId}
                onChanged={onChanged}
              />
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        <span>
          {t('users.showingOf', {
            shown: users.length,
            total: totalCount
          })}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-md px-2.5 py-1.5 font-mono transition-colors hover:bg-muted/60 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] transition-colors ${
                  p === page
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'hover:bg-muted/60'
                }`}
              >
                {p.toLocaleString('fa-IR')}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-md px-2.5 py-1.5 font-mono transition-colors hover:bg-muted/60 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
