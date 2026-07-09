// Endpoints added after the auth/RBAC + groups/plans migration. Kept in a
// sibling module so we don't have to expose ApiClient.request publicly.
// All calls use httpOnly cookie auth via credentials: 'include'.

import { getBrowserApiBaseUrl } from './api-base-url';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBrowserApiBaseUrl()}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

// ---------- Student groups (Mig 3) ----------------------------------------
export const studentGroupsApi = {
  list: () => call<{ status: string; data: any[] }>('/student-groups'),
  get: (id: number) =>
    call<{ status: string; data: any }>(`/student-groups/${id}`),
  create: (body: { name: string; description?: string }) =>
    call('/student-groups', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: number,
    body: { name?: string; description?: string; is_active?: boolean }
  ) =>
    call(`/student-groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  remove: (id: number) => call(`/student-groups/${id}`, { method: 'DELETE' }),
  addMembers: (id: number, profile_ids: number[]) =>
    call(`/student-groups/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ profile_ids })
    }),
  removeMember: (id: number, profileId: number) =>
    call(`/student-groups/${id}/members/${profileId}`, { method: 'DELETE' }),
  grantCourses: (id: number, course_ids: number[]) =>
    call(`/student-groups/${id}/courses`, {
      method: 'POST',
      body: JSON.stringify({ course_ids })
    }),
  revokeCourse: (id: number, courseId: number) =>
    call(`/student-groups/${id}/courses/${courseId}`, { method: 'DELETE' })
};

// ---------- Academy plans (Mig 4) -----------------------------------------
export type AcademyPlanKind = 'SUBSCRIPTION' | 'PACKAGE';

export const academyPlansApi = {
  list: (kind?: AcademyPlanKind) =>
    call<{ status: string; data: any[] }>(
      `/academy-plans${kind ? `?kind=${kind}` : ''}`
    ),
  get: (id: number) =>
    call<{ status: string; data: any }>(`/academy-plans/${id}`),
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
    }
  ) =>
    call(`/academy-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  remove: (id: number) => call(`/academy-plans/${id}`, { method: 'DELETE' }),
  subscribe: (id: number, profile_id: number, payment_id?: number) =>
    call(`/academy-plans/${id}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ profile_id, payment_id })
    }),
  cancelSubscription: (subscriptionId: number) =>
    call(`/academy-plans/subscriptions/${subscriptionId}`, { method: 'DELETE' })
};

// ---------- Auth: default academy + payment status -----------------------
export const userPrefsApi = {
  setDefaultAcademy: (academyId: number | null) =>
    call('/auth/me/default-academy', {
      method: 'PATCH',
      body: JSON.stringify({ academy_id: academyId })
    })
};

export const paymentsExtraApi = {
  status: (id: number) =>
    call<{
      status: string;
      data: { id: number; status: string; amount: number };
    }>(`/payments/${id}/status`)
};
