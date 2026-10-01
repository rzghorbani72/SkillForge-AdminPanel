import { ApiLayer09 } from './09-disconnect-from-store';
import type { Article, ArticleInput, ArticleTransition, BlogScope } from '@/types/blog';
import { Enrollment, User as UserType } from '@/types/api';
import type { AnalyticsCourses, AnalyticsOverview, AnalyticsRevenue } from '@/types/analytics';
import type { DashboardPeriodKey, ManagerDashboard } from '@/types/dashboard';
import type { CustomDomainSetupResponse, VerifyDnsResponse } from '@/types/custom-domain-setup';
import type { EnrollmentListResponse } from '@/types/learning-operations';
import { unwrapDataEnvelope } from '../helpers';

export class ApiLayer10 extends ApiLayer09 {
  async updateCustomDomainSetup(
    body: Partial<{
      hamravesh_attached: boolean;
      hamravesh_hostname: string;
      acme_records: Array<{ host: string; value: string }>;
      acme_confirmed: boolean;
      ssl_confirmed: boolean;
    }>,
  ): Promise<CustomDomainSetupResponse> {
    const response = await this.request('/academies/current/custom-domain-setup', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const payload = response.data as
      | CustomDomainSetupResponse
      | { data: CustomDomainSetupResponse };
    return (
      (payload as { data?: CustomDomainSetupResponse }).data ??
      (payload as CustomDomainSetupResponse)
    );
  }

  async verifyCustomDomainDns(): Promise<VerifyDnsResponse> {
    const response = await this.request('/academies/current/custom-domain-setup/verify-dns', {
      method: 'POST',
    });
    const payload = response.data as VerifyDnsResponse | { data: VerifyDnsResponse };
    return (payload as { data?: VerifyDnsResponse }).data ?? (payload as VerifyDnsResponse);
  }

  async getRecentEnrollments(limit = 10) {
    const response = await this.request(
      `/enrollments/recent?limit=${encodeURIComponent(String(limit))}`,
    );

    // Return the enrollments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getRecentPayments(limit = 10) {
    const response = await this.request(
      `/payments/recent?limit=${encodeURIComponent(String(limit))}`,
    );

    // Return the payments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getManagerDashboard(period: DashboardPeriodKey = '30d') {
    const res = await this.request<ManagerDashboard | { data: ManagerDashboard }>(
      `/dashboard/manager?period=${period}`,
    );
    return unwrapDataEnvelope(res.data);
  }

  async getAnalyticsOverview() {
    const res = await this.request<AnalyticsOverview | { data: AnalyticsOverview }>('/analytics');
    return unwrapDataEnvelope(res.data);
  }

  async getAnalyticsRevenue() {
    const res = await this.request<AnalyticsRevenue | { data: AnalyticsRevenue }>(
      '/analytics/revenue?group_by=month',
    );
    return unwrapDataEnvelope(res.data);
  }

  async getAnalyticsCourses() {
    const res = await this.request<AnalyticsCourses | { data: AnalyticsCourses }>(
      '/analytics/courses?limit=50',
    );
    return unwrapDataEnvelope(res.data);
  }

  // Blog (articles) endpoints. `scope` picks the academy blog or the platform
  // blog; the backend derives the tenant itself, never from these arguments.
  protected blogBase(scope: BlogScope): string {
    return scope === 'platform' ? '/platform/articles' : '/articles';
  }

  /** Article replies are wrapped in `{ message, status, data }` — unwrap once. */
  protected blogPayload<T>(body: unknown): T | null {
    return (body as { data?: T } | null)?.data ?? null;
  }

  async getBlogArticles(scope: BlogScope): Promise<Article[]> {
    const response = await this.request(this.blogBase(scope));
    const articles = this.blogPayload<Article[]>(response.data);
    return Array.isArray(articles) ? articles : [];
  }

  async getBlogArticle(scope: BlogScope, id: string): Promise<Article | null> {
    const response = await this.request(`${this.blogBase(scope)}/${id}`);
    return this.blogPayload<Article>(response.data);
  }

  async createBlogArticle(scope: BlogScope, input: ArticleInput): Promise<Article | null> {
    const response = await this.request(this.blogBase(scope), {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return this.blogPayload<Article>(response.data);
  }

  async updateBlogArticle(
    scope: BlogScope,
    id: string,
    input: Partial<ArticleInput>,
  ): Promise<Article | null> {
    const response = await this.request(`${this.blogBase(scope)}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return this.blogPayload<Article>(response.data);
  }

  async transitionBlogArticle(
    scope: BlogScope,
    id: string,
    transition: ArticleTransition,
    reviewNote?: string,
  ): Promise<Article | null> {
    const response = await this.request(`${this.blogBase(scope)}/${id}/${transition}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewNote ? { review_note: reviewNote } : {}),
    });
    return this.blogPayload<Article>(response.data);
  }

  async deleteBlogArticle(scope: BlogScope, id: string): Promise<void> {
    await this.request(`${this.blogBase(scope)}/${id}`, { method: 'DELETE' });
  }

  async getPayments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
    transaction_ref?: string;
    status?: string;
    academy_id?: string;
    course_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.transaction_ref) queryParams.append('transaction_ref', params.transaction_ref);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.academy_id) queryParams.append('academy_id', String(params.academy_id));
    if (params?.course_id) queryParams.append('course_id', String(params.course_id));
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    const query = queryParams.toString();
    const response = await this.request(`/payments${query ? `?${query}` : ''}`);
    return unwrapDataEnvelope(response.data) as {
      payments: unknown[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  }

  async getTransactionTracking(params?: {
    page?: number;
    limit?: number;
    search?: string;
    uuid?: string;
    transaction_ref?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.uuid) queryParams.append('uuid', params.uuid);
    if (params?.transaction_ref) {
      queryParams.append('transaction_ref', params.transaction_ref);
    }
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    const response = await this.request(`/payments/transactions${query ? `?${query}` : ''}`);
    return response.data || [];
  }

  async getTransactionTrackingById(id: string) {
    const response = await this.request(`/payments/transactions/${id}`);
    return response.data || null;
  }

  /**
   * Several providers/pages ask "who am I?" on the same mount; they share one
   * in-flight request instead of firing /auth/me (and its refresh retry) N times.
   */
  async getCurrentUser(): Promise<UserType | null> {
    if (!this.currentUserRequest) {
      this.currentUserRequest = this.request('/auth/me')
        .then((response) => (response.data as UserType) || null)
        .finally(() => {
          this.currentUserRequest = null;
        });
    }
    return this.currentUserRequest;
  }

  // Enrollments endpoints
  async getEnrollments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    course_id?: string;
    /** Enrollment rows are keyed by profile, not platform user. */
    profile_id?: string;
    user_id?: string;
    academy_id?: string;
  }): Promise<EnrollmentListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/enrollments?${queryString}` : '/enrollments';

    const response = await this.request<
      Enrollment[] | EnrollmentListResponse | { data: Enrollment[] | EnrollmentListResponse }
    >(url);
    const payload = unwrapDataEnvelope(response.data);
    return Array.isArray(payload) ? { enrollments: payload } : payload;
  }

  async getEnrollment(id: number) {
    const response = await this.request(`/enrollments/${id}`);

    // Return the enrollment data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async createEnrollment(enrollmentData: {
    user_id: number;
    course_id: number;
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  }) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  }

  async updateEnrollment(
    id: number,
    enrollmentData: {
      status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    },
  ) {
    return this.request(`/enrollments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(enrollmentData),
    });
  }

  async deleteEnrollment(id: number) {
    return this.request(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  }

  // Profiles endpoints (for getting all profiles)
  async getProfiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    academy_id?: string;
    is_active?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/profiles?${queryString}` : '/profiles';

    const response = await this.request(url);
    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      return payload.data;
    }

    return payload;
  }

  async getProfile(id: string) {
    const response = await this.request(`/profiles/${id}`);

    // Return the profile data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async deleteProfile(id: number) {
    return this.request(`/profiles/${id}`, {
      method: 'DELETE',
    });
  }
}
