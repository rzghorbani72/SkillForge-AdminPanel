'use client';

import { useCallback, useMemo, useState } from 'react';
import { permissionKey } from './permission-grid';
import type { CatalogResource, RolePermission } from '@/types/roles';

/** Ticked boxes of a permission grid, plus the payload shape the API expects. */
export function usePermissionSelection(initial: RolePermission[]) {
  const [granted, setGranted] = useState<Set<string>>(
    () => new Set(initial.map((p) => permissionKey(p.resource, p.action)))
  );

  const toggle = useCallback((resource: string, action: string) => {
    const key = permissionKey(resource, action);
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleResource = useCallback(
    (resources: CatalogResource[], resource: string, grantAll: boolean) => {
      const actions =
        resources.find((entry) => entry.resource === resource)?.actions ?? [];
      setGranted((prev) => {
        const next = new Set(prev);
        for (const action of actions) {
          const key = permissionKey(resource, action);
          if (grantAll) next.add(key);
          else next.delete(key);
        }
        return next;
      });
    },
    []
  );

  const replace = useCallback((permissions: RolePermission[]) => {
    setGranted(
      new Set(permissions.map((p) => permissionKey(p.resource, p.action)))
    );
  }, []);

  const permissions = useMemo<RolePermission[]>(
    () =>
      Array.from(granted).map((key) => {
        const [resource, action] = key.split(':');
        return { resource, action };
      }),
    [granted]
  );

  return { granted, toggle, toggleResource, replace, permissions };
}
