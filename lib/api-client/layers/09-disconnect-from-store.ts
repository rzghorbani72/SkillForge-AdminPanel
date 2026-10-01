import { ApiLayer08 } from './08-image-fetching-endpoint';
import {
  PlatformStaffListResponse,
  PlatformStaffLookup,
  PlatformStaffRecord,
  UserResetMode,
} from '@/types/api';
import type { CustomDomainSetupResponse } from '@/types/custom-domain-setup';
import type {
  CreateRolePayload,
  PermissionCatalog,
  RolePermission,
  RolesListResponse,
  UpdateRolePayload,
} from '@/types/roles';
import type { ReadOptions } from '../types-1';

export class ApiLayer09 extends ApiLayer08 {
  async disconnectFromStore(adminId: number, academyId?: string) {
    const queryParams = new URLSearchParams();
    if (academyId !== undefined) {
      queryParams.append('academy_id', academyId.toString());
    }
    const queryString = queryParams.toString();
    return this.request(
      `/users/${adminId}/disconnect-store${queryString ? `?${queryString}` : ''}`,
      {
        method: 'PATCH',
      },
    );
  }

  async createAdminUser(userData: {
    name: string;
    phone_number: string;
    email: string;
    password: string;
    phone_otp: string;
    email_otp: string;
    platform_role?: 'ADMIN' | 'FINANCE' | 'SUPPORT';
    auto_confirm_email?: boolean;
    auto_confirm_phone?: boolean;
  }) {
    const endpoint = userData.platform_role ? '/users/platform-staff' : '/users/admin';
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data as any;
  }

  async getPlatformStaff(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PlatformStaffListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) {
      queryParams.append('is_active', String(params.is_active));
    }
    const qs = queryParams.toString();
    const response = await this.request(`/users/platform-staff${qs ? `?${qs}` : ''}`);
    const payload = response.data as
      | PlatformStaffListResponse
      | { data?: PlatformStaffListResponse }
      | null;
    if (payload && 'profiles' in payload && payload.profiles) {
      return payload;
    }
    if (payload && 'data' in payload && payload.data?.profiles) {
      return payload.data;
    }
    return {
      profiles: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async lookupPlatformStaffCandidate(phone: string) {
    const qs = new URLSearchParams({ phone }).toString();
    const response = await this.request(`/users/platform-staff/lookup?${qs}`);
    const body = response.data as PlatformStaffLookup | { data?: PlatformStaffLookup } | null;
    if (body && 'found' in body) return body;
    if (body && 'data' in body && body.data) return body.data;
    return { found: false };
  }

  async promotePlatformStaff(body: {
    phone_number: string;
    platform_role: 'ADMIN' | 'FINANCE' | 'SUPPORT';
    password: string;
    name?: string;
  }) {
    const response = await this.request('/users/platform-staff/promote', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const payload = response.data as PlatformStaffRecord | { data?: PlatformStaffRecord } | null;
    if (payload && 'id' in payload) return payload;
    if (payload && 'data' in payload && payload.data) return payload.data;
    throw new Error('Failed to promote platform staff');
  }

  async updatePlatformStaff(
    id: string,
    body: {
      platform_role?: 'ADMIN' | 'FINANCE' | 'SUPPORT';
      is_active?: boolean;
      reason?: string;
    },
  ) {
    const response = await this.request(`/users/platform-staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data as any;
  }

  async banUserPlatformWide(userId: string, reason: string) {
    const response = await this.request(`/platform-admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data;
  }

  async unbanUserPlatformWide(userId: string) {
    const response = await this.request(`/platform-admin/users/${userId}/ban`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async resetPlatformUser(
    userId: string,
    body: {
      mode: UserResetMode;
      confirm_identifier?: string;
      academy_id?: string;
    },
  ) {
    const response = await this.request(`/platform-admin/users/${userId}/reset`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.data;
  }

  async suspendAcademy(academyId: string, reason: string) {
    const response = await this.request(`/platform-admin/academies/${academyId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data;
  }

  async unsuspendAcademy(academyId: string) {
    const response = await this.request(`/platform-admin/academies/${academyId}/suspend`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async banAcademyMember(profileId: string, reason: string) {
    const response = await this.request(`/users/${profileId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response.data;
  }

  async unbanAcademyMember(profileId: string) {
    const response = await this.request(`/users/${profileId}/ban`, {
      method: 'DELETE',
    });
    return response.data;
  }

  async revokePlatformStaffSessions(id: string) {
    const response = await this.request(`/users/platform-staff/${id}/sessions`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  async resetUserPassword(id: string, newPassword: string) {
    const response = await this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
    return response.data as any;
  }

  // ----- Platform roles & permissions (PLATFORM_OWNER, ADMIN, MANAGER) -----

  async getPermissionCatalog(): Promise<PermissionCatalog> {
    const response = await this.request('/platform/roles/catalog');
    return response.data as PermissionCatalog;
  }

  /** Roles the caller may give a NEW panel user (panel-only, below their rank). */
  async getAssignableRoles(): Promise<{
    roles: { name: string; label: string; hierarchy_level: number }[];
  }> {
    const response = await this.request('/platform/roles/assignable');
    return response.data as {
      roles: { name: string; label: string; hierarchy_level: number }[];
    };
  }

  async getPlatformRoles(opts?: ReadOptions): Promise<RolesListResponse> {
    const response = await this.request('/platform/roles', opts);
    return response.data as RolesListResponse;
  }

  async createPlatformRole(payload: CreateRolePayload) {
    const response = await this.request('/platform/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data as { id: string; name: string };
  }

  async updatePlatformRole(id: string, payload: UpdateRolePayload) {
    const response = await this.request(`/platform/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return response.data as { id: string };
  }

  async setPlatformRolePermissions(id: string, permissions: RolePermission[]) {
    const response = await this.request(`/platform/roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    return response.data as { id: string; permission_count: number };
  }

  async assignPlatformRole(id: string, profileId: string) {
    const response = await this.request(`/platform/roles/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId }),
    });
    return response.data as {
      profile_id: string;
      role_id: string;
      changed: boolean;
    };
  }

  async assignPlatformRoleToMany(id: string, profileIds: string[]) {
    const response = await this.request(`/platform/roles/${id}/assign-many`, {
      method: 'POST',
      body: JSON.stringify({ profile_ids: profileIds }),
    });
    return response.data as {
      results: {
        profile_id: string;
        status: 'assigned' | 'unchanged' | 'failed';
        reason?: string;
      }[];
    };
  }

  async deletePlatformRole(id: string) {
    const response = await this.request(`/platform/roles/${id}`, {
      method: 'DELETE',
    });
    return response.data as { id: string };
  }

  /** course_id is a cuid STRING — Number() on it yields NaN and the call 400s. */
  async grantCourseAccess(id: string, payload: { course_id: string; note?: string }) {
    const response = await this.request(`/users/${id}/grant-course`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data as any;
  }

  async assignVoucher(
    id: string,
    payload: {
      code_prefix: string;
      discount_type: 'PERCENT' | 'FIXED';
      discount_value: number;
      expires_at?: string;
      max_discount_amount?: number;
    },
  ) {
    const response = await this.request(`/users/${id}/assign-voucher`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data as any;
  }

  // Transactions endpoints
  async getTransactions() {
    const response = await this.request('/transactions');

    // Return the transactions data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getTransaction(id: number) {
    const response = await this.request(`/transactions/${id}`);

    // Return the transaction data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Domain endpoints
  async validatePrivateDomain(domain: string) {
    return this.request('/domain/is-valid-private-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  async generateUniqueDomainName() {
    return this.request('/domain/generate-unique-name');
  }

  async getCustomDomainSetup(): Promise<CustomDomainSetupResponse> {
    const response = await this.request('/academies/current/custom-domain-setup');
    const payload = response.data as
      | CustomDomainSetupResponse
      | { data: CustomDomainSetupResponse };
    return (
      (payload as { data?: CustomDomainSetupResponse }).data ??
      (payload as CustomDomainSetupResponse)
    );
  }
}
