// Endpoints added after the auth/RBAC + groups/plans migration. Kept in a
// sibling module so we don't have to expose ApiClient.request publicly.
// All calls use httpOnly cookie auth via credentials: 'include'.

import { call } from './api-call';

// ---------- Student groups (Mig 3) ----------------------------------------
// Every id here is a cuid STRING. Typing them as `number` (as this file once
// did) makes callers run parseInt/Number() and send NaN to the server.
export interface StudentGroupRecord {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  _count?: { Members: number; CourseGrants: number; LessonGrants: number };
}

/** GET /student-groups/:id — the list row plus its members and grants. */
export interface StudentGroupDetail extends StudentGroupRecord {
  Members: {
    id: string;
    profile_id: string;
    added_at: string;
    Profile: { id: string; display_name: string | null } | null;
  }[];
  CourseGrants: {
    id: string;
    course_id: string;
    granted_at: string;
    Course: { id: string; title: string | null } | null;
  }[];
  LessonGrants: {
    id: string;
    lesson_id: string;
    granted_at: string;
    Lesson: { id: string; title: string | null } | null;
  }[];
}

export const studentGroupsApi = {
  list: () => call<{ status: string; data: StudentGroupRecord[] }>('/student-groups'),
  get: (id: string) => call<{ status: string; data: StudentGroupDetail }>(`/student-groups/${id}`),
  create: (body: { name: string; description?: string }) =>
    call<{ status: string; data: StudentGroupRecord }>('/student-groups', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name?: string; description?: string; is_active?: boolean }) =>
    call(`/student-groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: string) => call(`/student-groups/${id}`, { method: 'DELETE' }),
  addMembers: (id: string, profile_ids: string[]) =>
    call(`/student-groups/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ profile_ids }),
    }),
  removeMember: (id: string, profileId: string) =>
    call(`/student-groups/${id}/members/${profileId}`, { method: 'DELETE' }),
  grantCourses: (id: string, course_ids: string[]) =>
    call(`/student-groups/${id}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_ids }),
    }),
  revokeCourse: (id: string, courseId: string) =>
    call(`/student-groups/${id}/courses/${courseId}`, { method: 'DELETE' }),
  grantLessons: (id: string, lesson_ids: string[]) =>
    call(`/student-groups/${id}/lessons`, {
      method: 'POST',
      body: JSON.stringify({ lesson_ids }),
    }),
  revokeLesson: (id: string, lessonId: string) =>
    call(`/student-groups/${id}/lessons/${lessonId}`, { method: 'DELETE' }),
};

// ---------- Manager → student messaging -----------------------------------
export type MessageChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'TELEGRAM' | 'BALE';

export interface SendMessageResult {
  id: string;
  uuid: string;
  recipient_count: number;
  sent: number;
  failed: number;
  skipped: number;
}

export const academyMessagesApi = {
  send: (body: {
    group_id?: string;
    profile_ids?: string[];
    title: string;
    body: string;
    channels: MessageChannel[];
  }) =>
    call<{ status: string; data: SendMessageResult }>('/academy-messages', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  list: () => call<{ status: string; data: unknown[] }>('/academy-messages'),
  get: (id: string) => call<{ status: string; data: unknown }>(`/academy-messages/${id}`),
};

// ---------- Academy plans (Mig 4) -----------------------------------------
export type AcademyPlanKind = 'SUBSCRIPTION' | 'PACKAGE';

export const academyPlansApi = {
  list: (kind?: AcademyPlanKind) =>
    call<{ status: string; data: any[] }>(`/academy-plans${kind ? `?kind=${kind}` : ''}`),
  get: (id: number) => call<{ status: string; data: any }>(`/academy-plans/${id}`),
  create: (body: {
    kind: AcademyPlanKind;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    duration_days?: number;
    course_ids?: number[];
  }) => call('/academy-plans', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: number,
    body: {
      name?: string;
      description?: string;
      price?: number;
      duration_days?: number;
      is_active?: boolean;
      course_ids?: number[];
    },
  ) =>
    call(`/academy-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (id: number) => call(`/academy-plans/${id}`, { method: 'DELETE' }),
  subscribe: (id: number, profile_id: number, payment_id?: number) =>
    call(`/academy-plans/${id}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ profile_id, payment_id }),
    }),
  cancelSubscription: (subscriptionId: number) =>
    call(`/academy-plans/subscriptions/${subscriptionId}`, { method: 'DELETE' }),
};

// ---------- Auth: default academy + payment status -----------------------
export const userPrefsApi = {
  setDefaultAcademy: (academyId: string | null) =>
    call('/auth/me/default-academy', {
      method: 'PATCH',
      body: JSON.stringify({ academy_id: academyId }),
    }),
};

export const paymentsExtraApi = {
  status: (id: number) =>
    call<{
      status: string;
      data: { id: number; status: string; amount: number };
    }>(`/payments/${id}/status`),
};

// ---------- Access grants --------------------------------------------------
// One canonical writer for "a manager handed this access out": many courses (or
// a bundle) to many students and groups, for one duration.

export type AccessDuration =
  | { mode: 'days'; days: number }
  | { mode: 'until'; until: string }
  | { mode: 'forever' };

export type GrantPricing =
  | { mode: 'FREE' }
  | { mode: 'FULL'; method: GrantPaymentMethod; reference?: string }
  | {
      mode: 'DISCOUNT';
      discount_type: 'PERCENT' | 'AMOUNT';
      discount_value: number;
      method: GrantPaymentMethod;
      reference?: string;
    };

export type GrantPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'POS' | 'ONLINE';

export interface CreateAccessGrantBody {
  course_ids?: string[];
  offer_id?: string;
  profile_ids?: string[];
  group_ids?: string[];
  duration: AccessDuration;
  pricing?: GrantPricing;
  idempotency_key?: string;
  note?: string;
}

export interface AccessGrantSummary {
  courses: number;
  students: number;
  groups: number;
  student_grants: number;
  group_grants: number;
  expires_at: string | null;
  list_amount: number;
  charged_amount: number;
  payment_id: string | null;
}

export interface StudentAccessGrant {
  enrollment_id: string;
  profile_id: string;
  name: string;
  phone: string | null;
  granted_at: string;
  expires_at: string | null;
  note: string | null;
}

export interface GroupAccessGrant {
  grant_id: string;
  group_id: string;
  name: string;
  members: number;
  granted_at: string;
  expires_at: string | null;
  note: string | null;
}

export const accessGrantsApi = {
  create: (body: CreateAccessGrantBody) =>
    call<AccessGrantSummary>('/access-grants', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  list: (courseId: string) =>
    call<{
      status: string;
      data: { students: StudentAccessGrant[]; groups: GroupAccessGrant[] };
    }>(`/access-grants?course_id=${encodeURIComponent(courseId)}`),
  revoke: (body: { course_id: string; profile_id?: string; group_id?: string }) =>
    call('/access-grants', { method: 'DELETE', body: JSON.stringify(body) }),
};
