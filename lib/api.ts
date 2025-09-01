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

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
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
    email?: string;
    phone?: string;
    password: string;
  }) {
    return this.request('/public-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData: {
    name: string;
    email?: string;
    phone: string;
    password: string;
  }) {
    return this.request('/public-auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/public-auth/logout', {
      method: 'POST'
    });
  }

  // Enhanced Auth endpoints
  async enhancedLogin(credentials: {
    phone_number: string;
    password?: string;
    otp?: string;
    school_id?: number;
    profile_id?: number;
  }) {
    return this.request('/enhanced-auth/public/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async enhancedRegister(userData: {
    name: string;
    phone_number: string;
    email?: string;
    password: string;
    confirmed_password: string;
    phone_otp: string;
    email_otp?: string;
    role: string;
    school_id?: number;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
    // School creation data (when creating new school)
    school_name?: string;
    school_slug?: string;
    school_description?: string;
  }) {
    return this.request('/enhanced-auth/public/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async switchProfile(profileId: number, schoolId: number) {
    return this.request('/enhanced-auth/switch-profile', {
      method: 'POST',
      body: JSON.stringify({
        profile_id: profileId,
        school_id: schoolId
      })
    });
  }

  async getUserProfiles() {
    return this.request('/enhanced-auth/profiles');
  }

  async getUserSchools() {
    return this.request('/enhanced-auth/schools');
  }

  async createProfile(profileData: {
    school_id: number;
    role: string;
    display_name: string;
    bio?: string;
    website?: string;
    location?: string;
  }) {
    return this.request('/enhanced-auth/create-profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  }

  async getUserContext() {
    return this.request('/enhanced-auth/context');
  }

  async validateRoleRegistration(schoolId: number, role: string) {
    return this.request(`/enhanced-auth/validate-role/${schoolId}/${role}`, {
      method: 'POST'
    });
  }

  async getPrimarySchool() {
    return this.request('/enhanced-auth/primary-school');
  }

  // OTP endpoints
  async sendPhoneOtp(phone_number: string) {
    console.log('API: Sending phone OTP request with:', { phone_number });
    return this.request('/public-auth/send-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number })
    });
  }

  async sendEmailOtp(email: string) {
    return this.request('/public-auth/send-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyPhoneOtp(phone_number: string, otp: string) {
    return this.request('/public-auth/verify-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number, otp })
    });
  }

  async verifyEmailOtp(email: string, otp: string) {
    return this.request('/public-auth/verify-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  }

  // Schools endpoints
  async getSchools() {
    return this.request('/schools');
  }

  async getMySchools() {
    return this.request('/schools/my-schools');
  }

  async getCurrentSchool() {
    return this.request('/schools/current');
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

    return this.request(`/courses?${queryParams.toString()}`);
  }

  async getCourse(id: number) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    meta_tags: Array<{ title: string; content: string }>;
    primary_price: number;
    secondary_price: number;
    currency: 'USD' | 'IRR' | 'TL' | 'EUR' | 'GBP';
    category_id?: number;
    season_id?: number;
    audio_id?: number;
    video_id?: number;
    image_id?: number;
    published?: boolean;
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

    return this.request(`/lessons?${queryParams.toString()}`);
  }

  async getLesson(id: number) {
    return this.request(`/lessons/${id}`);
  }

  async createLesson(lessonData: {
    title: string;
    description: string;
    content?: string;
    duration?: number;
    course_id: number;
    season_id?: number;
    media_id?: number;
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
    return this.request(`/season${queryParams}`);
  }

  async createSeason(seasonData: {
    title: string;
    description?: string;
    course_id: number;
  }) {
    return this.request('/season', {
      method: 'POST',
      body: JSON.stringify(seasonData)
    });
  }

  async updateSeason(id: number, seasonData: unknown) {
    return this.request(`/season/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seasonData)
    });
  }

  async deleteSeason(id: number) {
    return this.request(`/season/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/categories');
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
    metadata?: { title?: string; description?: string }
  ) {
    const formData = new FormData();
    formData.append('image', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/images/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData
    });
  }

  async uploadVideo(
    file: File,
    metadata?: { title?: string; description?: string }
  ) {
    const formData = new FormData();
    formData.append('video', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/videos/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData
    });
  }

  async uploadAudio(
    file: File,
    metadata?: { title?: string; description?: string }
  ) {
    const formData = new FormData();
    formData.append('audio', file);
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

  // Media endpoints
  async getMedia() {
    return this.request('/images');
  }

  async getImages() {
    return this.request('/images');
  }

  async getVideos() {
    return this.request('/videos');
  }

  async getAudio() {
    return this.request('/audio');
  }

  async getDocuments() {
    return this.request('/files');
  }

  // Profile endpoints
  async getCurrentProfile() {
    return this.request('/profiles/current');
  }

  async updateProfile(profileData: {
    display_name?: string;
    bio?: string;
    avatar_id?: number;
  }) {
    return this.request('/profiles/current', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
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

    return this.request(url);
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: number, userData: unknown) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  }

  // Transactions endpoints
  async getTransactions() {
    return this.request('/transactions');
  }

  async getTransaction(id: number) {
    return this.request(`/transactions/${id}`);
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
    return this.request('/enrollments/recent');
  }
  async getRecentPayments() {
    return this.request('/payments/recent');
  }

  // Articles endpoints
  async getArticles() {
    return this.request('/articles');
  }

  async getArticle(id: number) {
    return this.request(`/articles/${id}`);
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
    });
  }

  async updateArticle(id: number, articleData: unknown) {
    return this.request(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(articleData)
    });
  }

  async deleteArticle(id: number) {
    return this.request(`/articles/${id}`, {
      method: 'DELETE'
    });
  }

  async getArticleCategories() {
    return this.request('/articles/categories');
  }

  async getArticleTags() {
    return this.request('/articles/tags');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
