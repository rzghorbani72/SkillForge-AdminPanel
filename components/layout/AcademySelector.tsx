'use client';

import { useAuthUser } from '@/components/providers/user-provider';
import { isPlatformStaff } from '@/lib/roles';
import { AdminModeSwitcher } from './academy-selector/admin-mode-switcher';
import { ManagerAcademySwitcher } from './academy-selector/manager-academy-switcher';

const HIDDEN_ROLES = ['STUDENT', 'USER'];

/** Header control for moving between the academies a user belongs to. Two
 * variants share the popover pieces in `academy-selector/`: platform staff
 * get AdminModeSwitcher (header-scoped, no token reissue), everyone else gets
 * ManagerAcademySwitcher (reissues the auth token per academy). */
export function AcademySelector() {
  const { user } = useAuthUser();

  if (isPlatformStaff(user)) return <AdminModeSwitcher />;
  if (HIDDEN_ROLES.includes(user?.role ?? '')) return null;

  return <ManagerAcademySwitcher />;
}
