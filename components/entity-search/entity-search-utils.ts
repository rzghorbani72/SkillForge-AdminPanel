import { apiClient } from '@/lib/api';
import { getRoleLabel, type TranslateFn } from '@/lib/i18n/role-label';
import type {
  EntitySearchOption,
  EntitySearchProfilesResponse,
  EntitySearchUsersResponse
} from '@/types/entity-search';

export function mapUserToEntityOption(user: {
  id: number | string;
  display_name?: string;
  full_name?: string;
  name?: string;
  email?: string | null;
  phone_number?: string | null;
}): EntitySearchOption {
  const label =
    user.display_name ?? user.full_name ?? user.name ?? String(user.id);
  const description = user.email ?? user.phone_number ?? undefined;

  return {
    value: String(user.id),
    label,
    description
  };
}

export function mapUsersResponse(
  response: EntitySearchUsersResponse | null | undefined
): EntitySearchOption[] {
  return (response?.users ?? []).map(mapUserToEntityOption);
}

/** Drop the logged-in profile from pickers (group / role / access / enroll). */
export function withoutSelfProfile(
  options: EntitySearchOption[],
  selfProfileId?: string | number | null
): EntitySearchOption[] {
  if (selfProfileId == null || selfProfileId === '') return options;
  const selfId = String(selfProfileId);
  return options.filter((option) => option.value !== selfId);
}

export async function fetchStudentOptions(
  query: string,
  selfProfileId?: string | number | null,
  signal?: AbortSignal
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getStudentUsers(
    {
      ...(search ? { search } : {}),
      limit: 20
    },
    { signal }
  );
  return withoutSelfProfile(
    mapUsersResponse(response as EntitySearchUsersResponse),
    selfProfileId
  );
}

/**
 * Anyone in the current academy, tenant-scoped by the server (`GET /users`),
 * unlike fetchStudentOptions/fetchTeacherOptions which call the wider
 * /users/students and /users/teachers routes.
 *
 * Curried on `t` so the role shows its translated label instead of the raw
 * role code stored in the database. Pass `selfProfileId` so the actor cannot
 * pick themselves for role upgrades / assignments.
 */
export function createAcademyUserOptionsFetcher(
  t: TranslateFn,
  selfProfileId?: string | number | null
) {
  return async (
    query: string,
    signal?: AbortSignal
  ): Promise<EntitySearchOption[]> => {
    const search = query.trim();
    const response = (await apiClient.getUsers(
      {
        ...(search ? { search } : {}),
        limit: 20
      },
      { signal }
    )) as EntitySearchProfilesResponse | null;

    const options = (response?.profiles ?? []).map((profile) => ({
      value: profile.id,
      label:
        profile.display_name ??
        profile.full_name ??
        t('entitySearch.unnamedUser'),
      description:
        [
          profile.role_name ? getRoleLabel(profile.role_name, t) : null,
          profile.email ?? profile.phone_number
        ]
          .filter(Boolean)
          .join(' · ') || undefined
    }));

    return withoutSelfProfile(options, selfProfileId);
  };
}

export async function fetchTeacherOptions(
  query: string,
  signal?: AbortSignal
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getTeacherUsers(
    {
      ...(search ? { search } : {}),
      limit: 20
    },
    { signal }
  );
  return mapUsersResponse(response as EntitySearchUsersResponse);
}

export async function resolveUserOption(
  id: string,
  role: 'student' | 'teacher'
): Promise<EntitySearchOption | null> {
  const fetcher =
    role === 'student' ? fetchStudentOptions : fetchTeacherOptions;
  // Resolve without excluding self so existing selections still label correctly.
  const options = await fetcher(id);
  return options.find((option) => option.value === id) ?? null;
}

export async function fetchCourseOptions(
  query: string,
  signal?: AbortSignal
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getCourses(
    {
      ...(search ? { search } : {}),
      limit: 20
    },
    { signal }
  );
  return (response.courses ?? []).map((course) => ({
    value: String(course.id),
    label: course.title,
    description: course.slug ? `#${course.slug}` : undefined
  }));
}

export async function resolveCourseOption(
  id: string
): Promise<EntitySearchOption | null> {
  const course = await apiClient.getCourse(id);
  if (!course) {
    return null;
  }
  return {
    value: String(course.id),
    label: course.title
  };
}
