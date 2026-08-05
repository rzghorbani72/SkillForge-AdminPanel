'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import type { PlatformRole } from '@/types/roles';

const CHIP = 'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium';

/** System/custom, scope, and a marker on the card of the role you are using. */
export function RoleCardBadges({
  role,
  isOwnRole
}: {
  role: PlatformRole;
  isOwnRole: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex shrink-0 flex-wrap justify-end gap-1">
      {isOwnRole && (
        <span className={`${CHIP} bg-amber-500/10 text-amber-600`}>
          {t('roles.yourRoleBadge')}
        </span>
      )}
      <span
        className={
          role.is_system
            ? `${CHIP} bg-muted text-muted-foreground`
            : `${CHIP} bg-primary/10 text-primary`
        }
      >
        {role.is_system ? t('roles.systemBadge') : t('roles.customBadge')}
      </span>
      {!role.is_system && (
        <span className={`${CHIP} bg-muted text-muted-foreground`}>
          {role.academy_id ? t('roles.scopeAcademy') : t('roles.scopePlatform')}
        </span>
      )}
    </div>
  );
}
