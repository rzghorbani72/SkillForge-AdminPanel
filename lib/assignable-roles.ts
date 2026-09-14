/** Student rank in SYSTEM_ROLE_DEFINITIONS — see Backend permission-catalog. */
const STUDENT_HIERARCHY_LEVEL = 1;

type RoleOption = {
  name: string;
  hierarchy_level: number;
};

/**
 * Which role a "add someone" form should start on.
 *
 * The API returns roles highest-rank first, so taking the first one offered a
 * manager "teacher" by default — yet almost everyone added to an academy is a
 * student. Matched by rank rather than by name so an academy's own
 * student-rank role (STUDENT_1, ...) wins too.
 */
export function defaultAssignableRole(roles: readonly RoleOption[]): string | undefined {
  const student =
    roles.find((role) => role.name === 'STUDENT') ??
    roles.find((role) => role.hierarchy_level === STUDENT_HIERARCHY_LEVEL);
  return (student ?? roles[0])?.name;
}
