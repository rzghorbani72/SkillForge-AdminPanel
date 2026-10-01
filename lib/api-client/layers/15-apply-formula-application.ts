import { ApiLayer14 } from './14-run-metrics-snapshot';
import type {
  AssignmentListResponse,
  AssignmentSubmission,
  LearningAssignment,
  LearningSummaryResponse,
  LearningTimelineResponse,
  OpsQueueResponse,
  SubmissionListResponse,
  ClassSession,
  CourseTopic,
  CertificateRoster,
  IssuedCertificate,
} from '@/types/learning-operations';
import { unwrapDataEnvelope } from '../helpers';

export class ApiLayer15 extends ApiLayer14 {
  async applyFormulaApplication(id: number) {
    const response = await this.request<any>(`/financial/formula-applications/${id}/apply`, {
      method: 'POST',
    });
    return response.data as any;
  }

  async deleteFormulaApplication(id: number) {
    const response = await this.request<any>(`/financial/formula-applications/${id}`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  // ============================================================================
  // DATABASE DASHBOARD API METHODS
  // ============================================================================

  async getDatabaseModels() {
    const response = await this.request<any>('/database/models', {
      method: 'GET',
    });
    return response.data as string[];
  }

  async getModelFields(modelName: string) {
    const response = await this.request<any>(`/database/models/${modelName}/fields`, {
      method: 'GET',
    });
    return response.data as { fields: any[]; sample: any };
  }

  async getModelRecords(
    modelName: string,
    params?: {
      page?: number;
      limit?: number;
      where?: string;
      orderBy?: string;
    },
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.where) queryParams.append('where', params.where);
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy);

    const url = `/database/models/${modelName}/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(url, { method: 'GET' });
    return response.data as {
      data: any[];
      total: number;
      page: number;
      limit: number;
    };
  }

  async getModelRecord(modelName: string, id: number) {
    const response = await this.request<any>(`/database/models/${modelName}/records/${id}`, {
      method: 'GET',
    });
    return response.data as any;
  }

  async createModelRecord(modelName: string, data: any) {
    const response = await this.request<any>(`/database/models/${modelName}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async updateModelRecord(modelName: string, id: number, data: any) {
    const response = await this.request<any>(`/database/models/${modelName}/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data as any;
  }

  async deleteModelRecord(modelName: string, id: number) {
    const response = await this.request<any>(`/database/models/${modelName}/records/${id}`, {
      method: 'DELETE',
    });
    return response.data as any;
  }

  // ─── Assignments ───────────────────────────────────────────────────────────

  async getAssignments(params?: {
    page?: number;
    limit?: number;
    lesson_id?: string;
    season_id?: string;
    tutoring_group_id?: string;
    tutoring_session_id?: string;
    course_id?: string;
  }): Promise<AssignmentListResponse> {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const url = qs.toString() ? `/assignments?${qs}` : '/assignments';
    const res = await this.request<AssignmentListResponse | { data: AssignmentListResponse }>(url);
    return unwrapDataEnvelope(res.data);
  }

  async createAssignment(data: {
    /** Exactly one parent: a lesson, a season, a whole class, or one meeting of it. */
    lesson_id?: string;
    season_id?: string;
    tutoring_group_id?: string;
    tutoring_session_id?: string;
    title: string;
    description?: string;
    due_date?: string;
    max_score?: number;
    is_required?: boolean;
  }): Promise<LearningAssignment> {
    const res = await this.request<LearningAssignment | { data: LearningAssignment }>(
      '/assignments',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateAssignment(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      due_date: string;
      max_score: number;
      is_required: boolean;
    }>,
  ): Promise<LearningAssignment> {
    const res = await this.request<LearningAssignment | { data: LearningAssignment }>(
      `/assignments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getSubmissions(params?: {
    page?: number;
    limit?: number;
    assignment_id?: string;
    profile_id?: string;
    enrollment_id?: string;
    course_id?: string;
    status?: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'REJECTED';
  }): Promise<SubmissionListResponse> {
    const qs = new URLSearchParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.append(k, String(v));
      });
    const url = qs.toString() ? `/assignments/submissions?${qs}` : '/assignments/submissions';
    const res = await this.request<SubmissionListResponse | { data: SubmissionListResponse }>(url);
    return unwrapDataEnvelope(res.data);
  }

  async gradeSubmission(
    submissionId: string,
    data: { score: number; feedback?: string },
  ): Promise<AssignmentSubmission> {
    const res = await this.request<AssignmentSubmission | { data: AssignmentSubmission }>(
      `/assignments/submissions/${submissionId}/grade`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  // ─── Learning record ───────────────────────────────────────────────────────

  async getLearningTimeline(params?: {
    profile_id?: string;
    enrollment_id?: string;
    course_id?: string;
    page?: number;
    limit?: number;
  }): Promise<LearningTimelineResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString() ? `/learning-record/timeline?${qs}` : '/learning-record/timeline';
    const res = await this.request<LearningTimelineResponse | { data: LearningTimelineResponse }>(
      url,
    );
    return unwrapDataEnvelope(res.data);
  }

  async getLearningSummary(params?: {
    profile_id?: string;
    course_id?: string;
  }): Promise<LearningSummaryResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString() ? `/learning-record/summary?${qs}` : '/learning-record/summary';
    const res = await this.request<LearningSummaryResponse | { data: LearningSummaryResponse }>(
      url,
    );
    return unwrapDataEnvelope(res.data);
  }

  async getLearningOpsQueue(params?: {
    course_id?: string;
    inactive_days?: number;
    low_score_threshold?: number;
  }): Promise<OpsQueueResponse> {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) qs.append(key, String(value));
      });
    }
    const url = qs.toString() ? `/learning-record/ops/queue?${qs}` : '/learning-record/ops/queue';
    const res = await this.request<OpsQueueResponse | { data: OpsQueueResponse }>(url);
    return unwrapDataEnvelope(res.data);
  }

  async createInterventionNote(data: {
    profile_id: string;
    note: string;
    follow_up_at?: string;
    course_id?: string;
    enrollment_id?: string;
  }): Promise<{ id: string; created_at: string }> {
    const res = await this.request<
      { id: string; created_at: string } | { data: { id: string; created_at: string } }
    >('/learning-record/ops/intervention-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapDataEnvelope(res.data);
  }

  // ─── Certificates ──────────────────────────────────────────────────────────

  async getCertificateRoster(courseId: string): Promise<CertificateRoster> {
    const res = await this.request<CertificateRoster | { data: CertificateRoster }>(
      `/courses/${courseId}/certificates/roster`,
    );
    return unwrapDataEnvelope(res.data) as CertificateRoster;
  }

  async issueCertificate(enrollmentId: string): Promise<IssuedCertificate> {
    const res = await this.request<IssuedCertificate | { data: IssuedCertificate }>(
      '/certificates',
      {
        method: 'POST',
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      },
    );
    return unwrapDataEnvelope(res.data) as IssuedCertificate;
  }

  async revokeCertificate(certificateId: string, reason?: string): Promise<IssuedCertificate> {
    const res = await this.request<IssuedCertificate | { data: IssuedCertificate }>(
      `/certificates/${certificateId}/revoke`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
    return unwrapDataEnvelope(res.data) as IssuedCertificate;
  }

  // ─── Live course syllabus ──────────────────────────────────────────────────

  async getCourseTopics(courseId: string): Promise<CourseTopic[]> {
    const res = await this.request<CourseTopic[] | { data: CourseTopic[] }>(
      `/courses/${courseId}/topics`,
    );
    return unwrapDataEnvelope(res.data) ?? [];
  }

  async replaceCourseTopics(
    courseId: string,
    topics: { id?: string; title: string; description?: string | null }[],
  ): Promise<CourseTopic[]> {
    const res = await this.request<CourseTopic[] | { data: CourseTopic[] }>(
      `/courses/${courseId}/topics`,
      { method: 'PUT', body: JSON.stringify({ topics }) },
    );
    return unwrapDataEnvelope(res.data) ?? [];
  }

  // ─── Class sessions ────────────────────────────────────────────────────────

  async getClassSessions(groupId: string): Promise<ClassSession[]> {
    const res = await this.request<ClassSession[] | { data: ClassSession[] }>(
      `/tutoring/groups/${groupId}/sessions`,
    );
    return unwrapDataEnvelope(res.data) ?? [];
  }

  async getEngagementSessions(engagementId: string): Promise<ClassSession[]> {
    const res = await this.request<ClassSession[] | { data: ClassSession[] }>(
      `/tutoring/engagements/${engagementId}/sessions`,
    );
    return unwrapDataEnvelope(res.data) ?? [];
  }

  async updateClassSession(
    sessionId: string,
    data: {
      title?: string | null;
      topic_id?: string | null;
      notes?: string | null;
      meeting_url?: string | null;
    },
  ): Promise<ClassSession> {
    const res = await this.request<ClassSession | { data: ClassSession }>(
      `/tutoring/class-sessions/${sessionId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }
}
