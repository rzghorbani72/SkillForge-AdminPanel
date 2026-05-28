'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { toneToHsl } from './user-avatar';
import { useTranslation } from '@/lib/i18n/hooks';

export type RoleConfig = {
  id: string;
  label: string;
  tone: number;
  system: boolean;
  permissions: string[];
};

export function UserRoleBadge({
  role,
  tone = 22,
  onClick
}: {
  role?: string;
  tone?: number;
  onClick?: () => void;
}) {
  const colors = toneToHsl(tone);
  return (
    <button
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-opacity hover:opacity-80"
      style={{ background: colors.bg, color: colors.text }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: colors.dot
        }}
      />
      {role}
      {onClick && (
        <ChevronDown style={{ width: 11, height: 11, opacity: 0.7 }} />
      )}
    </button>
  );
}

type RoleMenuProps = {
  currentRole?: string;
  roles: RoleConfig[];
  userId: number;
  onClose: () => void;
  onChange: (userId: number, newRoleId: string) => void;
};

export function UserRoleMenu({
  currentRole,
  roles,
  userId,
  onClose,
  onChange
}: RoleMenuProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute start-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border bg-card p-1.5 shadow-lg"
    >
      <div className="mb-1 px-2 py-1 text-[10.5px] uppercase tracking-widest text-muted-foreground/70">
        {t('users.changeRole')}
      </div>
      {roles.map((r) => {
        const isCurrent = r.id === currentRole;
        const colors = toneToHsl(r.tone);
        return (
          <button
            key={r.id}
            onClick={() => {
              onChange(userId, r.id);
              onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] transition-colors hover:bg-muted/60"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.dot
              }}
            />
            <span className="flex-1 text-start">{r.label}</span>
            {isCurrent && (
              <Check
                style={{ width: 14, height: 14, color: 'hsl(var(--primary))' }}
              />
            )}
          </button>
        );
      })}
      <div className="my-1 border-t border-border" />
      <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-destructive transition-colors hover:bg-destructive/10">
        <X style={{ width: 13, height: 13 }} />
        <span className="flex-1 text-start">{t('users.suspendAccess')}</span>
      </button>
    </div>
  );
}
