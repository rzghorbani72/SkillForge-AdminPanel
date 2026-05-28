'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Shield, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import type { RoleConfig } from './user-role-badge';

// Static Tailwind classes per role — avoids runtime HSL computation
const ROLE_ICON_CLASS: Record<string, string> = {
  STUDENT: 'bg-blue-50 text-blue-700',
  TEACHER: 'bg-emerald-50 text-emerald-700',
  MANAGER: 'bg-amber-50 text-amber-700'
};

// Raw fetch so 403 errors are silent — no apiClient toast/redirect
async function fetchRoleCount(path: string): Promise<number> {
  try {
    const res = await fetch(`${getBrowserApiBaseUrl()}${path}`, {
      credentials: 'include'
    });
    if (!res.ok) return 0;
    const body = await res.json();
    const inner = body?.data?.data ?? body?.data;
    return inner?.pagination?.total ?? 0;
  } catch {
    return 0;
  }
}

type RoleWithCount = RoleConfig & { count: number };

export function UsersRolesGrid({
  roles,
  onAdd
}: {
  roles: RoleConfig[];
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const isAdmin = user?.role === 'ADMIN';

  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const [studentCount, teacherCount, managerCount] = await Promise.all([
        fetchRoleCount('/users/students?limit=1'),
        fetchRoleCount('/users/teachers?limit=1'),
        isAdmin ? fetchRoleCount('/users/managers?limit=1') : Promise.resolve(0)
      ]);
      setRoleCounts({
        STUDENT: studentCount,
        TEACHER: teacherCount,
        MANAGER: managerCount
      });
    }
    loadCounts();
  }, [isAdmin]);

  const rolesWithCounts: RoleWithCount[] = roles.map((r) => ({
    ...r,
    count: roleCounts[r.id] ?? 0
  }));

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
      {rolesWithCounts.map((r) => {
        const iconClass =
          ROLE_ICON_CLASS[r.id] ?? 'bg-muted text-muted-foreground';
        return (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] text-sm font-bold ${iconClass}`}
                >
                  {r.label.slice(0, 1)}
                </span>
                <div>
                  <div className="text-[14px] font-semibold">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.id}
                  </div>
                </div>
              </div>
              {r.system ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Shield className="h-2.5 w-2.5" /> {t('users.systemRole')}
                </span>
              ) : (
                isAdmin && (
                  <button
                    type="button"
                    aria-label={t('common.actions')}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                )
              )}
            </div>
            <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('users.users')}
              </span>
              <span className="font-mono text-[16px] font-bold">
                {r.count > 0 ? r.count.toLocaleString('fa-IR') : '—'}
              </span>
            </div>
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('users.permissionsLabel')}
              </div>
              <div className="space-y-1.5">
                {r.permissions.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-muted-foreground/80">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {isAdmin && (
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[14px] font-semibold text-foreground">
            {t('users.addRole')}
          </span>
          <span className="max-w-[200px] text-center text-[11.5px]">
            {t('users.newRoleDescription')}
          </span>
        </button>
      )}
    </div>
  );
}
