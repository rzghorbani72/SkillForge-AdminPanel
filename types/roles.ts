export type PermissionAction = 'read' | 'write' | 'delete';

export interface CatalogResource {
  resource: string;
  actions: PermissionAction[];
}

export interface PermissionCatalog {
  resources: CatalogResource[];
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
  user_count: number;
  permissions: RolePermission[];
}

export interface RolesListResponse {
  roles: PlatformRole[];
}

export interface CreateRolePayload {
  name: string;
  label?: string;
  description?: string;
  hierarchy_level: number;
}

export interface UpdateRolePayload {
  label?: string;
  description?: string;
  is_active?: boolean;
}
