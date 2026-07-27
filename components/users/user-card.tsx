'use client';

import type { ReactNode } from 'react';
import { Mail, Phone } from 'lucide-react';
import { UserAvatar } from './user-avatar';
import { UserStatusPill } from './user-status-pill';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { User } from '@/types/api';

export function getUserRoleName(user: User): string {
  return (
    user.role_name ??
    user.profiles?.[0]?.role?.name ??
    user.profiles?.[0]?.Role?.name ??
    ''
  );
}

export function getUserStatus(user: User): string {
  return user.status ?? (user.is_active ? 'ACTIVE' : 'INACTIVE');
}

/** Stable per-user hue so the same person keeps the same avatar colour. */
export function userTone(user: User): number {
  return (user.id * 47) % 360;
}

interface UserCardProps {
  user: User;
  actions?: ReactNode;
}

export function UserCard({ user, actions }: UserCardProps) {
  const { t } = useTranslation();
  const role = getUserRoleName(user);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar
            name={user.display_name || user.name}
            tone={userTone(user)}
            size={40}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">
              {user.display_name || user.name}
            </p>
            {role && (
              <p className="truncate text-[11px] text-muted-foreground">
                {getRoleLabel(role, t)}
              </p>
            )}
          </div>
        </div>
        <UserStatusPill status={getUserStatus(user)} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{user.email || '—'}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span dir="ltr">{user.phone_number || '—'}</span>
        </p>
      </div>

      {actions && <div className="mt-auto flex gap-2 pt-4">{actions}</div>}
    </div>
  );
}
