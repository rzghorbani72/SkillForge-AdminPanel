import { ApiLayer05 } from './05-update-course';

export class ApiLayer06 extends ApiLayer05 {
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
      body: JSON.stringify(addressData),
    });
  }

  async updateShippingAddress(id: number, addressData: unknown) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  }

  async deleteShippingAddress(id: number) {
    return this.request(`/shipping/addresses/${id}`, {
      method: 'DELETE',
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
      body: JSON.stringify(orderData),
    });
  }

  // Lessons endpoints
  async getLessons(params?: {
    course_id?: string;
    season_id?: string;
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

  async getLesson(id: string) {
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
    course_id: string;
    season_id?: string;
    audio_id?: string;
    video_id?: string;
    cover_id?: string;
    document_id?: string;
    published?: boolean;
    is_free?: boolean;
    lesson_type?: string;
  }) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(id: string, lessonData: unknown) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(id: string) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  async upsertLiveSession(
    lessonId: string,
    body: {
      meeting_url?: string;
      regenerate?: boolean;
      playback_url?: string | null;
      starts_at: string;
      ends_at?: string | null;
      duration_minutes?: number | null;
      timezone: string;
      recurrence_rule?: string | null;
      recurrence_until?: string | null;
      provider_label?: string | null;
      notes?: string | null;
    },
  ) {
    return this.request(`/lessons/${lessonId}/live-session`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteLiveSession(lessonId: string) {
    return this.request(`/lessons/${lessonId}/live-session`, {
      method: 'DELETE',
    });
  }

  // Seasons endpoints
  async getSeasons(courseId?: string) {
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

  async getSeason(id: string) {
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
    course_id: string;
  }) {
    return this.request('/seasons', {
      method: 'POST',
      body: JSON.stringify(seasonData),
    });
  }

  async updateSeason(id: string, seasonData: unknown) {
    return this.request(`/seasons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(seasonData),
    });
  }

  async deleteSeason(id: string) {
    return this.request(`/seasons/${id}`, {
      method: 'DELETE',
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
    type?:
      | 'COURSE'
      | 'ARTICLE'
      | 'BLOG'
      | 'NEWS'
      | 'VIDEO'
      | 'AUDIO'
      | 'DOCUMENT'
      | 'IMAGE'
      | 'ROOT';
    parent_id?: number;
    icon?: string;
    color?: string;
    sort_order?: number;
    is_active?: boolean;
  }) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(
    id: number,
    categoryData: {
      name?: string;
      description?: string;
      type?:
        | 'COURSE'
        | 'ARTICLE'
        | 'BLOG'
        | 'NEWS'
        | 'VIDEO'
        | 'AUDIO'
        | 'DOCUMENT'
        | 'IMAGE'
        | 'ROOT';
      parent_id?: number;
      icon?: string;
      color?: string;
      sort_order?: number;
      is_active?: boolean;
    },
  ) {
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

  /** Stores the image as the video's cover (poster) on the video row. */
  async attachVideoPoster(videoId: string, poster: File) {
    const formData = new FormData();
    formData.append('posterfile', poster);
    return this.uploadFileWithProgress(`/videos/${videoId}/poster`, formData);
  }
}
