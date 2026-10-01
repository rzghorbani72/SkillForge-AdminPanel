import { ApiLayer04 } from './04-set-academy-showcase';
import type { DiscussionParent } from '@/types/learning-operations';
import { unwrapDataEnvelope } from '../helpers';
import type { QuizSettingsPayload } from '../types-1';

export class ApiLayer05 extends ApiLayer04 {
  async updateCourse(id: string, courseData: unknown) {
    return this.request(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  }

  // Atomic "save the whole course": course fields + every season/lesson +
  // deletes in ONE backend transaction (no half-saved course on failure).
  async updateCourseContent(
    id: string,
    payload: {
      title?: string;
      description?: string;
      learning_outcomes?: string;
      requirements?: string;
      difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
      is_certificate?: boolean;
      primary_price?: number;
      secondary_price?: number;
      category_id?: string;
      cover_id?: string | null;
      published?: boolean;
      is_featured?: boolean;
      base_price_active?: boolean;
      access_duration_days?: number | null;
      seasons: Array<{
        id?: string;
        client_key: string;
        title: string;
        description?: string;
      }>;
      lessons: Array<{
        id?: string;
        client_key: string;
        title: string;
        description?: string;
        duration?: number;
        is_free?: boolean;
        published?: boolean;
        video_id?: string;
        audio_id?: string;
        cover_id?: string | null;
        season_id?: string;
        season_client_key?: string;
      }>;
      deleted_season_ids?: string[];
      deleted_lesson_ids?: string[];
    },
  ) {
    return this.request(`/courses/${id}/content`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Q&A endpoints
  async getCourseQnAs(courseId: number) {
    const response = await this.request(`/courses/${courseId}/qna`);
    const payload = response.data as { data?: unknown } | undefined;
    const nested = payload && typeof payload === 'object' ? payload.data : undefined;
    if (Array.isArray(nested)) return nested;
    if (
      nested &&
      typeof nested === 'object' &&
      Array.isArray((nested as { items?: unknown }).items)
    ) {
      return (nested as { items: unknown[] }).items;
    }
    return [];
  }

  async createCourseQnA(courseId: number, question: string) {
    return this.request(`/courses/${courseId}/qna`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async answerCourseQnA(courseId: number, qnaId: number, answer: string) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/answer`, {
      method: 'PUT',
      body: JSON.stringify({ answer }),
    });
  }

  async approveCourseQnA(courseId: number, qnaId: number, isApproved: boolean) {
    return this.request(`/courses/${courseId}/qna/${qnaId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved: isApproved }),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // ----- Quiz, Assessment & Discussion (checklist 5.19) -----
  protected async quizData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await this.request<{ data: T }>(endpoint, options);
    return (response.data as { data: T }).data;
  }

  async getLessonQuiz<T = unknown>(lessonId: string) {
    return this.quizData<T>(`/lessons/${lessonId}/quiz`);
  }

  async getSeasonQuiz<T = unknown>(seasonId: string) {
    return this.quizData<T>(`/seasons/${seasonId}/quiz`);
  }

  async getCourseQuiz<T = unknown>(courseId: string) {
    return this.quizData<T>(`/courses/${courseId}/quiz`);
  }

  async getSessionQuiz<T = unknown>(sessionId: string) {
    return this.quizData<T>(`/tutoring-sessions/${sessionId}/quiz`);
  }

  async createQuiz(
    payload: (
      | { lesson_id: string }
      | { season_id: string }
      | { course_id: string }
      | { tutoring_session_id: string }
    ) & {
      title: string;
      description?: string;
    } & Partial<QuizSettingsPayload>,
  ) {
    return this.quizData(`/quizzes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateQuiz(
    id: string,
    payload: { title?: string; description?: string } & Partial<QuizSettingsPayload>,
  ) {
    return this.quizData(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async addQuizQuestion(
    quizId: string,
    payload: {
      prompt: string;
      points?: number;
      options: { text: string; is_correct: boolean }[];
    },
  ) {
    return this.quizData(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateQuizQuestion(
    questionId: string,
    payload: {
      prompt?: string;
      points?: number;
      correct_boolean?: boolean;
      options?: { text: string; is_correct: boolean }[];
    },
  ) {
    return this.quizData(`/quiz-questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteQuizQuestion(questionId: string) {
    return this.quizData(`/quiz-questions/${questionId}`, { method: 'DELETE' });
  }

  async reorderQuizQuestions(quizId: string, questionIds: string[]) {
    return this.quizData(`/quizzes/${quizId}/questions/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ question_ids: questionIds }),
    });
  }

  async setQuizPublished(quizId: string, publish: boolean) {
    return this.quizData(`/quizzes/${quizId}/${publish ? 'publish' : 'unpublish'}`, {
      method: 'POST',
    });
  }

  async listQuizAttempts<T = unknown>(quizId: string) {
    return this.quizData<T>(`/quizzes/${quizId}/attempts`);
  }

  async getQuizAttempt<T = unknown>(attemptId: string) {
    return this.quizData<T>(`/quiz-attempts/${attemptId}`);
  }

  async gradeQuizAnswer(answerId: string, awardedPoints: number) {
    return this.quizData(`/quiz-answers/${answerId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify({ awarded_points: awardedPoints }),
    });
  }

  async reviewQuizAttempt(attemptId: string, feedback?: string) {
    return this.quizData(`/quiz-attempts/${attemptId}/review`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async getDiscussionThread<T = unknown>(threadId: string) {
    return this.quizData<T>(`/discussions/threads/${threadId}`);
  }

  async findDiscussionThread<T = unknown>(parent: DiscussionParent) {
    const query = new URLSearchParams(
      Object.entries(parent).filter(([, value]) => Boolean(value)) as [string, string][],
    );
    return this.quizData<T>(`/discussions/thread?${query.toString()}`);
  }

  async postDiscussionMessage(parent: DiscussionParent, body: string, documentId?: string) {
    return this.quizData(`/discussions/messages`, {
      method: 'POST',
      body: JSON.stringify({
        ...parent,
        body,
        ...(documentId ? { document_id: documentId } : {}),
      }),
    });
  }

  /** A file for a chat message; the returned id is sent with the message. */
  async uploadDiscussionAttachment(file: File): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.uploadFileWithProgress('/discussions/attachments', formData);
    return unwrapDataEnvelope(res as { data: { id: string } });
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
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: unknown) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}
