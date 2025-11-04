import { OtpType } from '@/constants/data';
import { User as UserType } from '@/types/api';

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

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Don't set Content-Type for FormData (let browser set it to multipart/form-data)
    const headers =
      options.body instanceof FormData
        ? { ...options.headers } // No Content-Type for FormData
        : { 'Content-Type': 'application/json', ...options.headers };

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
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
      body: JSON.stringify({ phone_number, otp })
    }) as any;
  }

  async verifyEmailOtp(email: string, otp: string, type: OtpType) {
    return this.request('/auth/otp/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
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
    if (response.data) {
      return response.data as any;
    }
    return null as any;
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

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE'
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

    // Return the lessons data directly
    if (response.data) {
      return response.data as { lessons: any[]; pagination?: any };
    }

    return response;
  }

  async getLesson(id: number) {
    const response = await this.request(`/lessons/${id}`);
    if (response.data) {
      return response.data as { lesson: any };
    }
    return null as any;
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

    // Return the seasons data directly
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data) {
      return response.data as any[];
    }
    return [];
  }

  async getSeason(id: number) {
    const response = await this.request(`/seasons/${id}`);
    if (response.data) {
      return response.data as any;
    }
    return null;
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

    return this.request('/audio/upload', {
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

  async getAudio() {
    const response = await this.request('/audio');

    // Return the audio data directly
    if (response.data) {
      return response.data as any;
    }
    return null as any;
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
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';
    school_id?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.school_id)
      queryParams.append('school_id', params.school_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response = await this.request(url);

    // Return the users data directly
    if (response.data) {
      return response.data;
    }
    return response;
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

    // Return the enrollments data directly
    if (response.data) {
      return response.data;
    }
    return response;
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

    // Return the profiles data directly
    if (response.data) {
      return response.data;
    }
    return response;
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
  }) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getUserProfiles() {
    return this.request('/auth/profiles', {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
