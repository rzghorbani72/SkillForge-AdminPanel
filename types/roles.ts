export type PermissionAction = 'read' | 'write' | 'delete';

export interface CatalogResource {
  resource: string;
  actions: PermissionAction[];
}

/** Starting grants offered when a role is created at this access level. */
export interface LevelDefaults {
  level: number;
  permissions: RolePermission[];
}

export interface PermissionCatalog {
  resources: CatalogResource[];
  defaults: LevelDefaults[];
}

export interface RolePermission {
  resource: string;
  action: string;
}

export interface PlatformRole {
  id: string;
  name: string;
  label: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  hierarchy_level: number;
  /** null = global/platform-wide role; set = scoped to one academy (MANAGER-created). */
  academy_id: string | null;
  created_at: string;
  user_count: number;
  permissions: RolePermission[];
}

export interface RolesListResponse {
  roles: PlatformRole[];
}

export interface CreateRolePayload {
  /** No `name`: the server derives the internal key from `hierarchy_level`. */
  label: string;
  description?: string;
  hierarchy_level: number;
  permissions?: RolePermission[];
}

export interface UpdateRolePayload {
  label?: string;
  description?: string;
  is_active?: boolean;
}
