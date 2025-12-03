import { OtpType } from '@/constants/data';
import { User as UserType } from '@/types/api';
import { toast } from 'react-toastify';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Attempt to refresh the access token using the refresh token cookie
   * Returns true if refresh was successful, false otherwise
   */
  private async refreshToken(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('[Auth] Token refreshed successfully');
          return true;
        }

        console.warn('[Auth] Token refresh failed:', response.status);
        return false;
      } catch (error) {
        console.error('[Auth] Token refresh error:', error);
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Redirect to login page (client-side only)
   */
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname + window.location.search;
      // Don't redirect if already on auth pages
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register')
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryAfterRefresh: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // SECURITY: JWT token is stored in HttpOnly cookie and sent automatically by browser
    // We no longer read tokens from localStorage to prevent XSS attacks
    // The browser will automatically include the HttpOnly cookie with credentials: 'include'

    // Don't set Content-Type for FormData (let browser set it to multipart/form-data)
    const headersObj: Record<string, string> =
      options.body instanceof FormData
        ? { ...(options.headers as Record<string, string>) } // No Content-Type for FormData
        : {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>)
          };

    // SECURITY: JWT is automatically sent via HttpOnly cookie with credentials: 'include'
    // No need to manually add Authorization header for cookie-based auth

    // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
    if (
      typeof window !== 'undefined' &&
      options.method &&
      !['GET', 'HEAD'].includes(options.method)
    ) {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('csrf-token='))
        ?.split('=')[1];

      if (csrfToken && !headersObj['X-CSRF-Token']) {
        headersObj['X-CSRF-Token'] = csrfToken;
      }
    }

    // Add school ID header if available (from localStorage - non-sensitive context data)
    if (typeof window !== 'undefined') {
      // Use the same key as school-utils.ts
      const schoolId = window.localStorage.getItem(
        'skillforge_selected_school_id'
      );
      if (schoolId && !headersObj['X-School-ID']) {
        headersObj['X-School-ID'] = schoolId;
      }
    }

    const headers: HeadersInit = headersObj;

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options
    };

    if (process.env.NODE_ENV !== 'production') {
      config.cache = 'no-store';
      (config as any).next = {
        ...(options as any)?.next,
        revalidate: 0
      };
    }

    try {
      const response = await fetch(url, config);

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Response has no JSON body or failed to parse; keep data as null
      }

      // Handle unauthorized responses - attempt token refresh
      if (response.status === 401 && retryAfterRefresh) {
        // Skip refresh for auth endpoints (login, register, etc.)
        const isAuthEndpoint =
          endpoint.includes('/auth/login') ||
          endpoint.includes('/auth/register') ||
          endpoint.includes('/auth/refresh');

        if (!isAuthEndpoint) {
          console.log('[Auth] Access token expired, attempting refresh...');
          const refreshSuccess = await this.refreshToken();

          if (refreshSuccess) {
            // Retry the original request with the new token
            return this.request<T>(endpoint, options, false);
          }
        }

        // Refresh failed or was auth endpoint - redirect to login
        const errorMessage =
          (data && (data.message || data.error)) ||
          'Session expired. Please log in again.';

        if (typeof window !== 'undefined') {
          toast.error(errorMessage);
          this.redirectToLogin();
        }

        throw new Error(errorMessage);
      }

      if (!response.ok) {
        throw new Error(
          (data && (data.message || data.error)) ||
            `HTTP error! status: ${response.status}`
        );
      }

      return {
        data,
        status: response.status
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: {
    identifier: string;
    password: string;
    school_id?: number;
  }) {
    const response = this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    return response;
  }

  async register(userData: {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    confirmed_password: string;
    role: string;
    school_id?: number;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
    // School creation data (for MANAGER role)
    school_name?: string;
    school_slug?: string;
    school_description?: string;
    // Teacher request data
    teacher_request?: boolean;
    teacher_request_reason?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async loginPhoneByOtp(credentials: {
    phone_number: string;
    otp: string;
    school_id?: number;
  }) {
    return this.request('/auth/login-by-phone-otp', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async loginEmailByOtp(credentials: {
    email: string;
    otp: string;
    school_id?: number;
  }) {
    return this.request('/auth/login-by-email-otp', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async selectSchool(data: { temp_token: string; school_id: number }) {
    return this.request('/auth/select-school', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Note: These enhanced auth endpoints have been removed
  // Use the standard auth endpoints instead
  async switchProfile() {
    throw new Error(
      'switchProfile endpoint not available - use standard auth flow'
    );
  }

  async getUserSchools() {
    const response = await this.request('/schools');
    return response.data;
  }

  async createProfile(profileData: {
    school_id: number;
    role: string;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  // OTP endpoints - Updated to use new OTP controller
  async sendPhoneOtp(phone_number: string, type: OtpType) {
    return this.request('/auth/otp/send-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, type })
    }) as any;
  }

  async sendEmailOtp(email: string, type: OtpType) {
    return this.request('/auth/otp/send-email', {
      method: 'POST',
      body: JSON.stringify({ email, type })
    }) as any;
  }

  async verifyPhoneOtp(phone_number: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp, type })
    }) as any;
  }

  async verifyEmailOtp(email: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type })
    }) as any;
  }

  // Forget password endpoints
  async forgetPassword(data: {
    identifier: string;
    password: string;
    confirmed_password: string;
    otp: string;
    role?: string;
    school_id?: number;
  }) {
    return this.request('/auth/forget-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Schools endpoints
  async getSchools() {
    const response = await this.request('/schools');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getSchoolsPublic() {
    const response = await this.request('/schools/public');
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getMySchools() {
    const response = await this.request('/schools/my-schools');
    return response;
  }

  async getCurrentSchool() {
    const response = await this.request('/schools/current');
    return response;
  }

  async createSchool(schoolData: {
    name: string;
    private_domain: string;
    description?: string;
  }) {
    return this.request('/schools', {
      method: 'POST',
      body: JSON.stringify(schoolData)
    });
  }

  async updateSchool(schoolData: {
    name?: string;
    private_domain?: string;
    description?: string;
  }) {
    return this.request('/schools/current', {
      method: 'PATCH',
      body: JSON.stringify(schoolData)
    });
  }

  // Courses endpoints
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    school_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = (await this.request(
      `/courses?${queryParams.toString()}`
    )) as any;
    if (response.data.data && response.data.status === 'ok') {
      return response.data.data as { courses: any[]; pagination?: any };
    }
    return { courses: [], pagination: undefined };
  }

  async getCourse(id: number) {
    const response = await this.request(`/courses/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    // Handle standard API shape: { status: 'ok', data: {...}, user_state?: {...} }
    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    // Fallback for APIs that wrap the resource under `data`
    if (payload.data) {
      return payload.data;
    }

    // As a last resort, return the payload itself (already the resource)
    return payload;
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    short_description?: string;
    primary_price: number;
    secondary_price: number;
    meta_tags: Array<{ title: string; content: string }>;
    category_id?: number;
    season_id?: number;
    audio_id?: number;
    video_id?: number;
    image_id?: number;
    published?: boolean;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    language?: string;
    requirements?: string;
    learning_outcomes?: string;
    duration?: number;
  }) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(id: number, courseData: unknown) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData)
    });
  }

  // Q&A endpoints
  async getCourseQnAs(courseId: number) {
    const response = await this.request(`/courses/${courseId}/qna`);
    return response.data?.data ?? [];
  }

  async createCourseQnA(courseId: number, question: string) {
    return this.request(`/courses/${courseId}/qna`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }

  async answerCourseQnA(courseId: number, qnaId: number, answer: string) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/answer`, {
      method: 'PUT',
      body: JSON.stringify({ answer })
    });
  }

  async approveCourseQnA(courseId: number, qnaId: number, isApproved: boolean) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved: isApproved })
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE'
    });
  }

  // Products endpoints
  async getProducts(params?: {
    search?: string;
    title?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
    order_by?: string;
    published?: boolean;
    is_featured?: boolean;
    product_type?: 'DIGITAL' | 'PHYSICAL';
    category_id?: number;
    author_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const response = await this.request(endpoint);
    const payload = response.data as any;

    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data as { products: any[]; pagination?: any };
    }
    return { products: [], pagination: undefined };
  }

  async getProduct(id: number) {
    const response = await this.request(`/products/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createProduct(productData: {
    title: string;
    description: string;
    short_description?: string;
    price: number;
    original_price?: number;
    product_type: 'DIGITAL' | 'PHYSICAL';
    stock_quantity?: number;
    sku?: string;
    category_id?: number;
    cover_id?: number;
    published?: boolean;
    is_featured?: boolean;
    weight?: number;
    dimensions?: string;
  }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id: number, productData: unknown) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Shipping & Orders endpoints
  async getShippingAddresses() {
    const response = await this.request('/shipping/addresses');
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return [];
  }

  async createShippingAddress(addressData: {
    full_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state_province?: string;
    postal_code?: string;
    is_default?: boolean;
  }) {
    return this.request('/shipping/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateShippingAddress(id: number, addressData: unknown) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData)
    });
  }

  async deleteShippingAddress(id: number) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'DELETE'
    });
  }

  async getOrders() {
    const response = await this.request('/shipping/orders');
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return [];
  }

  async getOrder(id: number) {
    const response = await this.request(`/shipping/orders/${id}`);
    const payload = response.data as any;
    if (payload && payload.status === 'ok' && payload.data) {
      return payload.data;
    }
    return null;
  }

  async createOrder(orderData: {
    items: Array<{
      item_type: 'COURSE' | 'PRODUCT';
      item_id: number;
      quantity?: number;
    }>;
    shipping_address_id?: number;
    notes?: string;
  }) {
    return this.request('/shipping/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // Lessons endpoints
  async getLessons(params?: {
    course_id?: number;
    season_id?: number;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await this.request(`/lessons?${queryParams.toString()}`);
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.lessons)) {
      return payload.lessons;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getLesson(id: number) {
    const response = await this.request(`/lessons/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createLesson(lessonData: {
    title: string;
    description?: string;
    season_id: number;
    audio_id?: number;
    video_id?: number;
    image_id?: number;
    document_id?: number;
    category_id?: number;
    published?: boolean;
    is_free?: boolean;
    lesson_type?: string;
  }) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  }

  async updateLesson(id: number, lessonData: unknown) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData)
    });
  }

  async deleteLesson(id: number) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE'
    });
  }

  // Seasons endpoints
  async getSeasons(courseId?: number) {
    const queryParams = courseId ? `?course_id=${courseId}` : '';
    const response = await this.request(`/seasons${queryParams}`);
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getSeason(id: number) {
    const response = await this.request(`/seasons/${id}`);
    const payload = response.data as any;

    if (!payload) {
      return null as any;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async createSeason(seasonData: {
    title: string;
    description?: string;
    order: number;
    course_id: number;
  }) {
    return this.request('/seasons', {
      method: 'POST',
      body: JSON.stringify(seasonData)
    });
  }

  async updateSeason(id: number, seasonData: unknown) {
    return this.request(`/seasons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seasonData)
    });
  }

  async deleteSeason(id: number) {
    return this.request(`/seasons/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories endpoints
  async getCategories() {
    const response = await this.request('/categories');

    // Return the categories data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
    type?: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS';
    parent_id?: number;
    icon?: string;
    color?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(
    id: number,
    categoryData: {
      name?: string;
      description?: string;
      type?: 'COURSE' | 'ARTICLE' | 'BLOG' | 'NEWS';
      parent_id?: number;
      icon?: string;
      color?: string;
      sort_order?: number;
      is_active?: boolean;
    }
  ) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Media endpoints
  async uploadImage(
    file: File,
    metadata?: { title?: string; description?: string },
    signal?: AbortSignal
  ) {
    const formData = new FormData();
    formData.append('imagefile', file); // Backend expects 'imagefile'
    formData.append('alt', metadata?.title || file.name); // Backend expects 'alt' field

    const response = await this.request('/images/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
      signal
    });

    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Alternative upload method with better progress tracking
  async uploadVideoWithProgress(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('videofile', file);

    if (posterFile) {
      formData.append('posterfile', posterFile);
    }

    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let lastProgress = 0;

      // Handle abort controller
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Progress tracking with throttling
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);

          // Only update if progress has actually changed
          if (progress !== lastProgress) {
            lastProgress = progress;
            console.log(
              `Upload progress: ${event.loaded}/${event.total} bytes (${progress}%)`
            );
            onProgress(progress);
          }
        }
      });

      // Event handlers
      xhr.upload.addEventListener('loadstart', () => {
        console.log('Upload started');
        if (onProgress) onProgress(0);
      });

      xhr.upload.addEventListener('loadend', () => {
        console.log('Upload ended');
        // Don't set progress to 100% here - let the response handler do it
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Set progress to 100% when upload is successful
            if (onProgress) onProgress(100);
            resolve(response.data || response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () =>
        reject(new Error('Upload cancelled'))
      );
      xhr.ontimeout = () => reject(new Error('Upload timeout'));

      xhr.open('POST', `${this.baseURL}/videos/upload`);
      xhr.withCredentials = true;
      xhr.timeout = 300000; // 5 minutes

      console.log(`Starting upload: ${file.name} (${file.size} bytes)`);
      xhr.send(formData);
    });
  }

  async uploadVideo(
    file: File,
    metadata?: { title?: string; description?: string },
    posterFile?: File,
    onProgress?: (progress: number) => void,
    abortController?: AbortController
  ) {
    const formData = new FormData();
    formData.append('videofile', file); // Backend expects 'videofile'

    if (posterFile) {
      formData.append('posterfile', posterFile); // Backend expects 'posterfile'
    }

    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Handle abort controller
      if (abortController) {
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Track upload progress with more detailed logging
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(
            `Upload progress: ${event.loaded}/${event.total} bytes (${progress}%)`
          );
          onProgress(progress);
        } else {
          console.log('Progress event not computable:', {
            lengthComputable: event.lengthComputable,
            loaded: event.loaded,
            total: event.total
          });
        }
      });

      // Track loadstart
      xhr.upload.addEventListener('loadstart', () => {
        console.log('Upload started');
        if (onProgress) onProgress(0);
      });

      // Track loadend - don't set progress to 100% here as it happens before response processing
      xhr.upload.addEventListener('loadend', () => {
        console.log('Upload ended');
        // Don't set progress to 100% here - let the response handler do it
      });

      // Track error events
      xhr.upload.addEventListener('error', (event) => {
        console.error('Upload error:', event);
      });

      // Track abort events
      xhr.upload.addEventListener('abort', (event) => {
        console.log('Upload aborted:', event);
      });

      // Handle response
      xhr.addEventListener('load', () => {
        console.log('Response received:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Set progress to 100% when upload is successful
            if (onProgress) onProgress(100);

            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Open and send request
      xhr.open('POST', `${this.baseURL}/videos/upload`);
      xhr.withCredentials = true; // Include credentials

      // Set timeout for better error handling
      xhr.timeout = 300000; // 5 minutes
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      console.log(`Starting upload: ${file.name} (${file.size} bytes)`);
      xhr.send(formData);
    });
  }

  async uploadAudio(
    file: File,
    metadata?: { title?: string; description?: string }
  ) {
    const formData = new FormData();
    formData.append('audioFile', file); // Backend expects 'audioFile'
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/audios/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData
    });
  }

  async uploadDocument(
    file: File,
    metadata?: { title?: string; description?: string }
  ) {
    const formData = new FormData();
    formData.append('documentfile', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData
    });
  }

  async getImages() {
    const response = await this.request('/images');
    // Return the images data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getVideos() {
    const response = await this.request('/videos');
    console.log('1.response getVideos', response);
    // Return the videos data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  getVideoStreamUrl(videoId: number): string {
    return `${this.baseURL}/videos/stream/${videoId}`;
  }

  async getVideo(videoId: number) {
    const response = await this.request(`/videos/${videoId}`);
    return response.data;
  }

  async getAudios() {
    const response = await this.request('/audios');
    const payload = response.data as any;

    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload.status === 'ok' && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.audios)) {
      return payload.audios;
    }

    if (Array.isArray(payload?.data?.audios)) {
      return payload.data.audios;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  async getAudio(audioId: number) {
    const response = await this.request(`/audios/${audioId}`);
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    if (payload.data) {
      return payload.data;
    }

    return payload;
  }

  async updateAudio(
    audioId: number,
    audioData: { title?: string; description?: string; is_public?: boolean }
  ) {
    const response = await this.request(`/audios/${audioId}`, {
      method: 'PATCH',
      body: JSON.stringify(audioData)
    });

    return response.data as any;
  }

  async deleteAudio(audioId: number) {
    return this.request(`/audios/${audioId}`, {
      method: 'DELETE'
    });
  }

  async getDocuments() {
    const response = await this.request('/files');

    // Return the documents data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Image fetching endpoint
  async getImage(identifier: string | number) {
    const endpoint =
      typeof identifier === 'number'
        ? `/images/get-image?id=${identifier}`
        : `/images/get-image?filename=${identifier}`;

    return this.request(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'image/*'
      }
    });
  }

  // Image update endpoint
  async updateImage(imageId: number, data: { alt?: string }) {
    const response = await this.request(`/images/${imageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Image deletion endpoint
  async deleteImage(imageId: number) {
    return this.request(`/images/${imageId}`, {
      method: 'DELETE'
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
    bio?: string;
    avatar_id?: number;
  }) {
    return this.request('/profiles/current', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    }) as any;
  }

  // Users endpoints
  private buildUserQuery(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.school_id)
      queryParams.append('school_id', params.school_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private mapUsersResponse(response: ApiResponse<any>) {
    const payload = response.data as any;

    if (!payload) {
      return null;
    }

    if (payload.status === 'ok' && payload.data) {
      return payload.data;
    }

    return payload;
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
    is_active?: boolean;
    group_by_role?: boolean;
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.school_id)
      queryParams.append('school_id', params.school_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.group_by_role) queryParams.append('group_by_role', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);

    // If grouped by role, return the full response structure
    if (params?.group_by_role) {
      return response.data;
    }

    return this.mapUsersResponse(response);
  }

  async getStudentUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/students${query}`);
    return this.mapUsersResponse(response);
  }

  async getTeacherUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/teachers${query}`);
    return this.mapUsersResponse(response);
  }

  async getManagerUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const query = this.buildUserQuery(params);
    const response = await this.request(`/users/managers${query}`);
    return this.mapUsersResponse(response);
  }

  async getTeacherRequests(params?: {
    page?: number;
    limit?: number;
    school_id?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.school_id)
      queryParams.append('school_id', params.school_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const response = await this.request(
      `/users/teacher-requests${queryString ? `?${queryString}` : ''}`
    );

    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      return payload.data;
    }

    return payload;
  }

  async reviewTeacherRequest(
    id: number,
    payload: {
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      notes?: string;
    }
  ) {
    const response = await this.request(`/teacher-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

    return response.data as any;
  }

  async getUser(id: number) {
    const response = await this.request(`/users/${id}`);

    // Return the user data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async updateUser(id: number, userData: unknown) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
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
      body: JSON.stringify({ domain })
    });
  }

  async generateUniqueDomainName() {
    return this.request('/domain/generate-unique-name');
  }

  async getRecentEnrollments() {
    const response = await this.request('/enrollments/recent');

    // Return the enrollments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getRecentPayments() {
    const response = await this.request('/payments/recent');

    // Return the payments data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  // Articles endpoints
  async getArticles() {
    const response = await this.request('/articles');

    // Return the articles data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getArticle(id: number) {
    const response = await this.request(`/articles/${id}`);
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async createArticle(articleData: {
    title: string;
    content: string;
    category_id: number;
    featured_image_id?: number;
  }) {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData)
    }) as any;
  }

  async updateArticle(id: number, articleData: unknown) {
    return this.request(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(articleData)
    }) as any;
  }

  async deleteArticle(id: number) {
    return this.request(`/articles/${id}`, {
      method: 'DELETE'
    }) as any;
  }

  async getArticleCategories() {
    const response = await this.request('/articles/categories');

    // Return the categories data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getArticleTags() {
    const response = await this.request('/articles/tags');

    // Return the tags data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
  }

  async getPayments() {
    const response = await this.request('/payments');
    return response.data || [];
  }
  async getCurrentUser(): Promise<UserType | null> {
    const response = await this.request('/auth/me');
    return (response.data as UserType) || null;
  }

  // Enrollments endpoints
  async getEnrollments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    course_id?: number;
    user_id?: number;
    school_id?: number;
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
    const url = queryString ? `/enrollments?${queryString}` : '/enrollments';

    const response = await this.request(url);
    const payload = response.data as any;

    if (payload?.status === 'ok' && payload?.data) {
      return payload.data;
    }

    return payload;
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
      body: JSON.stringify(enrollmentData)
    });
  }

  async updateEnrollment(
    id: number,
    enrollmentData: {
      status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    }
  ) {
    return this.request(`/enrollments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(enrollmentData)
    });
  }

  async deleteEnrollment(id: number) {
    return this.request(`/enrollments/${id}`, {
      method: 'DELETE'
    });
  }

  // Profiles endpoints (for getting all profiles)
  async getProfiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    school_id?: number;
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

  async getProfile(id: number) {
    const response = await this.request(`/profiles/${id}`);

    // Return the profile data directly
    if (response.data) {
      return response.data;
    }
    return response;
  }

  async deleteProfile(id: number) {
    return this.request(`/profiles/${id}`, {
      method: 'DELETE'
    });
  }

  // Profile password management
  async changeProfilePassword(data: {
    profile_id: number;
    current_password: string;
    new_password: string;
    confirm_new_password: string;
    user_id?: number;
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCurrentThemeConfig() {
    const response = await this.request('/theme/current/config');
    return response.data;
  }

  async updateCurrentThemeConfig(payload: {
    primary_color?: string;
    primary_color_light?: string;
    primary_color_dark?: string;
    secondary_color?: string;
    secondary_color_light?: string;
    secondary_color_dark?: string;
    accent_color?: string;
    background_color?: string;
    background_color_light?: string;
    background_color_dark?: string;
    dark_mode?: boolean | null;
    name?: string;
  }) {
    const response = await this.request('/theme/current/config', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async getUserProfiles() {
    return this.request('/auth/profiles', {
      method: 'POST'
    });
  }

  // UI Template endpoints
  async getCurrentUITemplate() {
    const response = await this.request('/ui-template/current');
    return response.data;
  }

  async createUITemplate(payload: {
    blocks: Array<{
      id: string;
      type: string;
      order: number;
      isVisible: boolean;
      config?: Record<string, any>;
    }>;
    is_active?: boolean;
  }) {
    const response = await this.request('/ui-template/current', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async updateUITemplate(payload: {
    blocks?: Array<{
      id: string;
      type: string;
      order: number;
      isVisible: boolean;
      config?: Record<string, any>;
    }>;
    template_preset?: string;
    is_active?: boolean;
  }) {
    const response = await this.request('/ui-template/current', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async getAvailableTemplatePresets() {
    const response = await this.request('/ui-template/presets');
    return response.data;
  }

  async applyTemplatePreset(presetId: string) {
    const response = await this.request(`/ui-template/presets/${presetId}`, {
      method: 'POST'
    });
    return response.data;
  }

  // Discounts endpoints
  async getDiscounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    school_id?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined)
      queryParams.append('is_active', params.is_active.toString());
    if (params?.school_id)
      queryParams.append('school_id', params.school_id.toString());

    const query = queryParams.toString();
    const response = await this.request<any>(
      `/discounts${query ? `?${query}` : ''}`
    );

    // Backend returns { message, status, data: { discounts, pagination } }
    // API client wraps it in { data: { message, status, data } }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async getDiscountById(id: number) {
    const response = await this.request<any>(`/discounts/${id}`);

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async createDiscount(discountData: {
    code: string;
    description?: string;
    discount_type: 'PERCENT' | 'FIXED';
    discount_value: number;
    school_id?: number;
    usage_limit?: number;
    usage_type: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
    start_date: string;
    end_date: string;
    is_active?: boolean;
    min_purchase_amount?: number;
    max_discount_amount?: number;
  }) {
    const response = await this.request<any>('/discounts', {
      method: 'POST',
      body: JSON.stringify(discountData)
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async updateDiscount(
    id: number,
    discountData: {
      description?: string;
      discount_type?: 'PERCENT' | 'FIXED';
      discount_value?: number;
      usage_limit?: number;
      usage_type?: 'ONE_TIME' | 'LIMITED' | 'UNLIMITED' | 'USER_SPECIFIC';
      start_date?: string;
      end_date?: string;
      is_active?: boolean;
      min_purchase_amount?: number;
      max_discount_amount?: number;
    }
  ) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(discountData)
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }

  async deleteDiscount(id: number) {
    const response = await this.request<any>(`/discounts/${id}`, {
      method: 'DELETE'
    });

    // Backend returns { message, status }
    return response.data as any;
  }

  async validateDiscount(code: string, amount: number, user_id?: number) {
    const response = await this.request<any>('/discounts/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount, user_id })
    });

    // Backend returns { message, status, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data;
    }
    return response.data as any;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
