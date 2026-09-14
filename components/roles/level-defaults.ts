import type { PermissionCatalog, RolePermission } from '@/types/roles';

/** The starting grants the server offers for one access level. */
export function defaultsFor(catalog: PermissionCatalog, level: number): RolePermission[] {
  return catalog.defaults.find((entry) => entry.level === level)?.permissions ?? [];
}
