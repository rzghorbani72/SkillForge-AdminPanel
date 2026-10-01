import { ApiLayer15 } from './15-apply-formula-application';
import type {
  CreateTutoringEngagementPayload,
  CreateTutoringOfferPayload,
  TutoringEngagement,
  TutoringGroup,
  TutoringOffer,
  ClassRequest,
  ClassRequestStatus,
  ClassSessionCancelResolution,
  CancelClassSessionResult,
  CancelClassPreview,
  CancelTutoringGroupPayload,
  CancelTutoringGroupResult,
  ClassSession,
  SessionMaterial,
  SessionRecording,
  CreateTutoringGroupPayload,
  UpdateTutoringGroupPayload,
  TutoringGroupSlot,
  UpdateTutoringOfferPayload,
} from '@/types/learning-operations';
import { unwrapDataEnvelope, uploadedFileId } from '../helpers';

export class ApiLayer16 extends ApiLayer15 {
  async rescheduleClassSession(
    sessionId: string,
    data: { starts_at: string; ends_at?: string | null },
  ): Promise<ClassSession> {
    const res = await this.request<ClassSession | { data: ClassSession }>(
      `/tutoring/class-sessions/${sessionId}/reschedule`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async setSessionRecording(
    sessionId: string,
    data: { video_id: string | null; allow_download?: boolean },
  ): Promise<SessionRecording | null> {
    const res = await this.request<SessionRecording | null | { data: SessionRecording | null }>(
      `/tutoring/class-sessions/${sessionId}/recording`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data) ?? null;
  }

  async addSessionMaterial(
    sessionId: string,
    data: {
      document_id?: string;
      video_id?: string;
      title?: string;
      allow_download?: boolean;
    },
  ): Promise<SessionMaterial> {
    const res = await this.request<SessionMaterial | { data: SessionMaterial }>(
      `/tutoring/class-sessions/${sessionId}/materials`,
      { method: 'POST', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  /** Upload a handout and attach it to the meeting in one step. */
  async addSessionMaterialFile(
    sessionId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<SessionMaterial> {
    const uploaded = await this.uploadDocument(file, { title: file.name }, onProgress);
    return this.addSessionMaterial(sessionId, {
      document_id: uploadedFileId(uploaded),
      title: file.name,
    });
  }

  /** Upload a helper video students may watch beside the live class. */
  async addSessionMaterialVideo(
    sessionId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<SessionMaterial> {
    const uploaded = await this.uploadVideo(file, { title: file.name }, undefined, onProgress);
    return this.addSessionMaterial(sessionId, {
      video_id: uploadedFileId(uploaded),
      title: file.name,
    });
  }

  async removeSessionMaterial(sessionId: string, materialId: string): Promise<void> {
    await this.request(`/tutoring/class-sessions/${sessionId}/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  async cancelClassSession(
    sessionId: string,
    payload: {
      resolution?: ClassSessionCancelResolution;
      makeup_starts_at?: string;
      makeup_ends_at?: string;
      reason?: string;
    },
  ): Promise<CancelClassSessionResult> {
    const res = await this.request<CancelClassSessionResult | { data: CancelClassSessionResult }>(
      `/tutoring/class-sessions/${sessionId}/cancel`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  // ─── Group classes ─────────────────────────────────────────────────────────

  async createTutoringGroup(data: CreateTutoringGroupPayload): Promise<TutoringGroup> {
    const res = await this.request<TutoringGroup | { data: TutoringGroup }>('/tutoring/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrapDataEnvelope(res.data);
  }

  async getTutoringGroups(params?: {
    course_id?: string;
    status?: string;
  }): Promise<TutoringGroup[]> {
    const qs = new URLSearchParams();
    if (params?.course_id) qs.append('course_id', params.course_id);
    if (params?.status) qs.append('status', params.status);
    const url = qs.toString() ? `/tutoring/groups?${qs}` : '/tutoring/groups';
    const res = await this.request<TutoringGroup[] | { data: TutoringGroup[] }>(url);
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }

  async getTutoringGroup(groupId: string): Promise<TutoringGroup> {
    const res = await this.request<TutoringGroup | { data: TutoringGroup }>(
      `/tutoring/groups/${groupId}`,
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateTutoringGroup(
    groupId: string,
    data: UpdateTutoringGroupPayload,
  ): Promise<TutoringGroup> {
    const res = await this.request<TutoringGroup | { data: TutoringGroup }>(
      `/tutoring/groups/${groupId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async replaceTutoringGroupSlots(
    groupId: string,
    slots: TutoringGroupSlot[],
  ): Promise<TutoringGroupSlot[]> {
    const writableSlots = slots.map(({ weekday, start_minute, duration_minutes, lesson_id }) => ({
      weekday,
      start_minute,
      duration_minutes,
      ...(lesson_id ? { lesson_id } : {}),
    }));
    const res = await this.request<TutoringGroupSlot[] | { data: TutoringGroupSlot[] }>(
      `/tutoring/groups/${groupId}/slots`,
      {
        method: 'PUT',
        body: JSON.stringify({ slots: writableSlots }),
      },
    );
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }

  async getClassRequests(params: {
    course_id?: string;
    engagement_id?: string;
    status?: ClassRequestStatus;
  }): Promise<ClassRequest[]> {
    const query = new URLSearchParams();
    if (params.course_id) query.set('course_id', params.course_id);
    if (params.engagement_id) query.set('engagement_id', params.engagement_id);
    if (params.status) query.set('status', params.status);
    const res = await this.request<ClassRequest[] | { data: ClassRequest[] }>(
      `/class-requests?${query.toString()}`,
    );
    return unwrapDataEnvelope(res.data);
  }

  async acceptClassRequest(requestId: string, groupId: string): Promise<void> {
    await this.request(`/class-requests/${requestId}/accept`, {
      method: 'PATCH',
      body: JSON.stringify({ group_id: groupId }),
    });
  }

  async declineClassRequest(requestId: string): Promise<void> {
    await this.request(`/class-requests/${requestId}/decline`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  }

  async reopenTutoringGroup(groupId: string): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/reopen`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async publishTutoringGroup(groupId: string): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/publish`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async confirmTutoringGroup(groupId: string): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async cancelTutoringGroup(
    groupId: string,
    payload: CancelTutoringGroupPayload = {},
  ): Promise<CancelTutoringGroupResult> {
    const res = await this.request<CancelTutoringGroupResult | { data: CancelTutoringGroupResult }>(
      `/tutoring/groups/${groupId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getCancelClassPreview(groupId: string): Promise<CancelClassPreview> {
    const res = await this.request<CancelClassPreview | { data: CancelClassPreview }>(
      `/tutoring/groups/${groupId}/cancel-preview`,
    );
    return unwrapDataEnvelope(res.data);
  }

  async updateTutoringGroupMeetingLink(
    groupId: string,
    meetingUrl: string | null,
    notify = true,
    regenerate = false,
  ): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/meeting-link`, {
      method: 'PATCH',
      body: JSON.stringify({
        meeting_url: meetingUrl || undefined,
        notify,
        regenerate,
      }),
    });
  }

  async updateTutoringGroupBackupLink(groupId: string, backupUrl: string | null): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/meeting-link`, {
      method: 'PATCH',
      body: JSON.stringify({ backup_meeting_url: backupUrl, notify: false }),
    });
  }

  async addTutoringGroupMember(
    groupId: string,
    studentProfileId: string,
    seats = 1,
  ): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ student_profile_id: studentProfileId, seats }),
    });
  }

  async removeTutoringGroupMember(groupId: string, studentProfileId: string): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/members/${studentProfileId}`, {
      method: 'DELETE',
    });
  }

  async announceToTutoringGroup(groupId: string, body: string, sendSms = false): Promise<void> {
    await this.request(`/tutoring/groups/${groupId}/announce`, {
      method: 'POST',
      body: JSON.stringify({ body, send_sms: sendSms }),
    });
  }

  // ─── Tutoring ──────────────────────────────────────────────────────────────

  /**
   * `feature_enabled_now` says the server switched tutor-led learning on for the
   * academy as part of this call, so the caller can report the change.
   */
  async createTutoringOffer(
    data: CreateTutoringOfferPayload,
  ): Promise<TutoringOffer & { feature_enabled_now?: boolean }> {
    const res = await this.request<
      TutoringOffer | { data: TutoringOffer; feature_enabled_now?: boolean }
    >('/tutoring/offers', { method: 'POST', body: JSON.stringify(data) });
    const body = res.data;
    const featureEnabledNow = 'feature_enabled_now' in body ? body.feature_enabled_now : undefined;
    return {
      ...unwrapDataEnvelope(body),
      feature_enabled_now: featureEnabledNow,
    };
  }

  async getTutoringOffers(params?: { course_id?: string }): Promise<TutoringOffer[]> {
    const qs = new URLSearchParams();
    if (params?.course_id) qs.append('course_id', params.course_id);
    const url = qs.toString() ? `/tutoring/offers?${qs}` : '/tutoring/offers';
    const res = await this.request<TutoringOffer[] | { data: TutoringOffer[] }>(url);
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }

  async updateTutoringOffer(
    offerId: string,
    data: UpdateTutoringOfferPayload,
  ): Promise<TutoringOffer> {
    const res = await this.request<TutoringOffer | { data: TutoringOffer }>(
      `/tutoring/offers/${offerId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
    );
    return unwrapDataEnvelope(res.data);
  }

  async createTutoringEngagement(
    data: CreateTutoringEngagementPayload,
  ): Promise<TutoringEngagement> {
    const res = await this.request<TutoringEngagement | { data: TutoringEngagement }>(
      '/tutoring/engagements',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return unwrapDataEnvelope(res.data);
  }

  async getTutoringEngagements(params?: { course_id?: string }): Promise<TutoringEngagement[]> {
    const qs = new URLSearchParams();
    if (params?.course_id) qs.append('course_id', params.course_id);
    const url = qs.toString() ? `/tutoring/engagements?${qs}` : '/tutoring/engagements';
    const res = await this.request<TutoringEngagement[] | { data: TutoringEngagement[] }>(url);
    const payload = unwrapDataEnvelope(res.data);
    return Array.isArray(payload) ? payload : [];
  }
}
