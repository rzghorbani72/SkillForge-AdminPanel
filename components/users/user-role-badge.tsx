'use client';

import { toneToHsl } from './user-avatar';

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
    </button>
  );
}
