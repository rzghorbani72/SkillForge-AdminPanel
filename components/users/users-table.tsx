'use client';

import { useAuthUser } from '@/hooks/useAuthUser';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { formatPhoneDisplay } from '@/lib/phone-utils';
import { UserAvatar } from './user-avatar';
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
  isSelf: boolean;
  callerRole?: string;
  onRoleClick: () => void;
  onChanged: () => void;
};

function UserRow({
  user,
  tone,
  roles,
  currentRoleId,
  isSelf,
  callerRole,
  onRoleClick,
  onChanged
}: UserRowProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
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
  const phoneDisplay = user.phone_number
    ? formatPhoneDisplay(user.phone_number, language)
    : '—';

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={displayName} tone={roleTone} size={32} />
          <div>
            <div className="flex items-center gap-1.5 text-base font-semibold leading-tight">
              {displayName || t('users.unnamedUser')}
              {isSelf && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {t('users.you')}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <UserRoleBadge role={roleLabel} tone={roleTone} onClick={onRoleClick} />
      </td>
      <td
        dir="ltr"
        className="px-4 py-3.5 text-end text-[15px] font-medium tabular-nums tracking-wide text-foreground"
      >
        {phoneDisplay}
      </td>
      <td className="px-4 py-3.5 text-sm text-muted-foreground">
        {user.created_at
          ? new Date(user.created_at).toLocaleDateString('fa-IR')
          : '—'}
      </td>
      <td className="px-4 py-3">
        <UserStatusPill
          status={user.status || (user.is_active ? 'active' : 'inactive')}
        />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <UserRowActions
          user={user}
          targetLevel={user.role_hierarchy_level}
          callerRole={callerRole}
          isSelf={isSelf}
          showDetailsLink
          onChanged={onChanged}
        />
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
  onChanged: () => void;
};

export function UsersTable({
  users,
  roles,
  totalCount,
  page,
  onPageChange,
  onRoleClick,
  onChanged
}: UsersTableProps) {
  const { t } = useTranslation();
  const { user: authUser } = useAuthUser();
  // Profile ids are cuids; authUser.id is typed as a number but holds one.
  const selfId = String(authUser?.id ?? '');
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
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common.name')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('userEdit.role')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common.phone')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('users.joinDate')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common.status')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-base text-muted-foreground"
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
                isSelf={String(u.id) === selfId}
                callerRole={authUser?.role}
                onRoleClick={onRoleClick}
                onChanged={onChanged}
              />
            ))
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
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
