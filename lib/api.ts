const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
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
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { email?: string; phone?: string; password: string }) {
    return this.request('/public-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/public-auth/logout', {
      method: 'POST',
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
      body: JSON.stringify(schoolData),
    });
  }

  async updateSchool(schoolData: {
    name?: string;
    private_domain?: string;
    description?: string;
  }) {
    return this.request('/schools/current', {
      method: 'PATCH',
      body: JSON.stringify(schoolData),
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
    short_description?: string;
    price: number;
    is_free: boolean;
    category_id?: number;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  }) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: number, courseData: any) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: number) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
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
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(id: number, lessonData: any) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(id: number) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE',
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
      body: JSON.stringify(seasonData),
    });
  }

  async updateSeason(id: number, seasonData: any) {
    return this.request(`/season/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seasonData),
    });
  }

  async deleteSeason(id: number) {
    return this.request(`/season/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
    type?: 'COURSE' | 'LESSON';
  }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: number, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Media endpoints
  async uploadImage(file: File, metadata?: { title?: string; description?: string }) {
    const formData = new FormData();
    formData.append('image', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/images/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async uploadVideo(file: File, metadata?: { title?: string; description?: string }) {
    const formData = new FormData();
    formData.append('video', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/videos/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async uploadAudio(file: File, metadata?: { title?: string; description?: string }) {
    const formData = new FormData();
    formData.append('audio', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/audio/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async uploadDocument(file: File, metadata?: { title?: string; description?: string }) {
    const formData = new FormData();
    formData.append('documentfile', file);
    if (metadata) {
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');
    }

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
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
      body: JSON.stringify(profileData),
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: number) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
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
      body: JSON.stringify({ domain }),
    });
  }

  async generateUniqueDomainName() {
    return this.request('/domain/generate-unique-name');
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 