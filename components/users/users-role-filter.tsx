'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { PlatformRole } from '@/types/roles';

/** Sentinel for "no role filter" — Radix Select rejects an empty-string value. */
export const ALL_ROLES = '__all__';

type UsersRoleFilterProps = {
  roles: PlatformRole[];
  value: string;
  onChange: (roleName: string) => void;
};

export function UsersRoleFilter({ roles, value, onChange }: UsersRoleFilterProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-44 text-[13px]">
        <SelectValue placeholder={t('users.filterByRole')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_ROLES}>{t('users.allRoles')}</SelectItem>
        {roles.map((role) => {
          // Built-in roles use their translation; a custom role has no key, so
          // it falls back to the label its creator typed.
          const translated = getRoleLabel(role.name, t);
          const label = translated === role.name ? role.label || role.name : translated;
          return (
            <SelectItem key={role.id} value={role.name}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
