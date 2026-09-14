'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { RolePermission } from '@/types/roles';

/**
 * What a role is allowed to do, shown as plain text. A role nobody may change
 * must not be drawn as a form: no checkboxes, nothing that invites a click.
 */
export function PermissionReadonlyList({ permissions }: { permissions: RolePermission[] }) {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const byResource = new Map<string, string[]>();
    for (const permission of permissions) {
      const actions = byResource.get(permission.resource) ?? [];
      if (!actions.includes(permission.action)) actions.push(permission.action);
      byResource.set(permission.resource, actions);
    }
    return Array.from(byResource.entries());
  }, [permissions]);

  if (grouped.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t('roles.noAccess')}</p>;
  }

  return (
    <ul className="space-y-2">
      {grouped.map(([resource, actions]) => (
        <li
          key={resource}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3"
        >
          <span className="text-sm font-medium">{t(`roles.resource.${resource}`)}</span>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((action) => (
              <span
                key={action}
                className="rounded-md bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {t(`roles.action.${action}`)}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
