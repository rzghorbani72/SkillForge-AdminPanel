import { apiClient } from '@/lib/api';
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

export async function fetchStudentOptions(
  query: string
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getStudentUsers({
    ...(search ? { search } : {}),
    limit: 20
  });
  return mapUsersResponse(response as EntitySearchUsersResponse);
}

/**
 * Anyone in the current academy, tenant-scoped by the server (`GET /users`),
 * unlike fetchStudentOptions/fetchTeacherOptions which call the wider
 * /users/students and /users/teachers routes.
 */
export async function fetchAcademyUserOptions(
  query: string
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = (await apiClient.getUsers({
    ...(search ? { search } : {}),
    limit: 20
  })) as EntitySearchProfilesResponse | null;

  return (response?.profiles ?? []).map((profile) => ({
    value: profile.id,
    label: profile.display_name ?? profile.full_name ?? profile.id,
    description:
      [profile.role_name, profile.email ?? profile.phone_number]
        .filter(Boolean)
        .join(' · ') || undefined
  }));
}

export async function fetchTeacherOptions(
  query: string
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getTeacherUsers({
    ...(search ? { search } : {}),
    limit: 20
  });
  return mapUsersResponse(response as EntitySearchUsersResponse);
}

export async function resolveUserOption(
  id: string,
  role: 'student' | 'teacher'
): Promise<EntitySearchOption | null> {
  const fetcher =
    role === 'student' ? fetchStudentOptions : fetchTeacherOptions;
  const options = await fetcher(id);
  return options.find((option) => option.value === id) ?? null;
}

export async function fetchCourseOptions(
  query: string
): Promise<EntitySearchOption[]> {
  const search = query.trim();
  const response = await apiClient.getCourses({
    ...(search ? { search } : {}),
    limit: 20
  });
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
