import { ApiLayer07 } from './07-upload-image';
import { User as UserType } from '@/types/api';
import type { UserDetailsResponse } from '@/types/user-details';
import { unwrapDataEnvelope } from '../helpers';
import type { ApiResponse, ReadOptions } from '../types-1';

export class ApiLayer08 extends ApiLayer07 {
  // Image fetching endpoint
  async getImage(identifier: string | number) {
    const endpoint =
      typeof identifier === 'number'
        ? `/images/get-image?id=${identifier}`
        : `/images/get-image?filename=${identifier}`;

    return this.request(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'image/*',
      },
    });
  }

  // Image update endpoint
  async updateImage(imageId: string, data: { alt?: string }) {
    const response = await this.request(`/images/${imageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Image deletion endpoint
  async deleteImage(imageId: string) {
    return this.request(`/images/${imageId}`, {
      method: 'DELETE',
    });
  }

  // Profile endpoints
  async getCurrentProfile() {
    const response = await this.request('/profiles/current');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async updateProfile(profileData: {
    display_name?: string;
    /** Image id returned by uploadImage — persisted as the profile avatar. */
    image_id?: string;
  }) {
    return this.request('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }) as any;
  }

  // Users endpoints
  protected buildUserQuery(params?: {
    page?: number;
    limit?: number;
    search?: string;
    id?: number;
    uuid?: string;
    academy_id?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.id !== undefined) queryParams.append('id', params.id.toString());
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  protected mapUsersResponse(response: ApiResponse<any>) {
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'fail') {
      throw new Error(payload.message || 'Failed to retrieve users');
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data?.profiles || payload.data?.pagination) {
      return payload.data;
    }

    if (payload.profiles || payload.pagination) {
      return payload;
    }

    return payload;
  }

  async getUsers(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      id?: number;
      uuid?: string;
      /** Role NAME — built-in or academy-defined (TEACHER_1, ...), never a fixed union. */
      role?: string;
      academy_id?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
      is_active?: boolean;
      group_by_role?: boolean;
      filter?: 'none';
    },
    opts?: ReadOptions,
  ) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.id !== undefined) queryParams.append('id', params.id.toString());
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.group_by_role) queryParams.append('group_by_role', 'true');
    if (params?.filter) queryParams.append('filter', params.filter);

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint, opts);

    // If grouped by role, return the full response structure
    if (params?.group_by_role) {
      return response.data;
    }

    return this.mapUsersResponse(response);
  }

  async getStudentUsers(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      academy_id?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
    },
    opts?: ReadOptions,
  ) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/students${query}`, opts);
    return this.mapUsersResponse(response);
  }

  async getTeacherUsers(
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      academy_id?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
    },
    opts?: ReadOptions,
  ) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/teachers${query}`, opts);
    return this.mapUsersResponse(response);
  }

  async getManagerUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    academy_id?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/managers${query}`);
    return this.mapUsersResponse(response);
  }

  async getTeacherRequests(params?: {
    page?: number;
    limit?: number;
    academy_id?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.academy_id) queryParams.append('academy_id', params.academy_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const response = await this.request(
      `/users/teacher-requests${queryString ? `?${queryString}` : ''}`,
    );

    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      const normalizedRequests = Array.isArray(payload.data.requests)
        ? payload.data.requests.map((request: any) => {
            const profile = request.profile || request.Profile_TeacherRequest_profile_idToProfile;
            const store = request.store || request.Academy;
            const reviewer =
              request.reviewer || request.Profile_TeacherRequest_reviewed_byToProfile;

            return {
              ...request,
              profile: profile
                ? {
                    id: profile.id,
                    display_name: profile.display_name,
                    role: profile.role || profile.Role || null,
                    user: profile.user || profile.User || null,
                  }
                : null,
              store,
              reviewer: reviewer
                ? {
                    ...reviewer,
                    user: reviewer.user || {
                      name: reviewer.display_name || null,
                    },
                  }
                : null,
            };
          })
        : [];

      return {
        ...payload.data,
        requests: normalizedRequests,
      };
    }

    return payload;
  }

  async reviewTeacherRequest(
    id: number,
    payload: {
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      notes?: string;
    },
  ) {
    const response = await this.request(`/teacher-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return response.data as any;
  }

  async getUser(id: string): Promise<UserType> {
    const response = await this.request<
      UserType | { status?: string; data?: UserType | string; message?: string }
    >(`/users/${id}`);
    const body = response.data;
    // findOne answers HTTP 200 with {status:'fail'} instead of a 4xx.
    if (body && typeof body === 'object' && 'status' in body && body.status === 'fail') {
      throw new Error(
        typeof body.data === 'string' ? body.data : body.message || 'Failed to retrieve user',
      );
    }
    const profile = unwrapDataEnvelope(body as UserType | { data: UserType });
    if (!profile || typeof profile !== 'object' || !('id' in profile)) {
      throw new Error('Failed to retrieve user');
    }
    return profile;
  }

  async getUserDetails(id: string): Promise<UserDetailsResponse> {
    const response = await this.request<UserDetailsResponse | { data: UserDetailsResponse }>(
      `/users/${id}/details`,
    );
    return unwrapDataEnvelope(response.data);
  }

  /** Rename yourself. `updateUser` cannot do this: it only reaches profiles
   *  below the caller's own rank, so it never matches the caller. */
  async updateMe(data: { full_name?: string; email?: string; phone_number?: string }) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async sendMyContactOtp(channel: 'phone' | 'email', value: string) {
    return this.request('/users/me/contact/otp', {
      method: 'POST',
      body: JSON.stringify({ channel, value }),
    });
  }

  async verifyMyContactOtp(channel: 'phone' | 'email', value: string, otp: string) {
    return this.request<{ success?: boolean }>('/users/me/contact/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ channel, value, otp }),
    });
  }

  async updateUser(id: string, userData: unknown) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}
