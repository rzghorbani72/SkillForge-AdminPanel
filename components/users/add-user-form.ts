export type AssignableRole = {
  name: string;
  label: string;
  hierarchy_level: number;
};

export type AddUserForm = {
  displayName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export const EMPTY_ADD_USER_FORM: AddUserForm = {
  displayName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
};

/** A number worth asking the server about — see README for why phone comes first. */
export const COMPLETE_PHONE = /^\+\d{11,15}$/;

/** Rank 1 and below is a learner, not staff — see SYSTEM_ROLE_DEFINITIONS. */
export function isStudentRankRole(
  roles: readonly AssignableRole[],
  roleName: string
): boolean {
  return (
    (roles.find((role) => role.name === roleName)?.hierarchy_level ?? 99) <= 1
  );
}
