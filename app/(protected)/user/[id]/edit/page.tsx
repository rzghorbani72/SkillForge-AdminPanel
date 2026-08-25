'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useAssignableRoles } from '@/hooks/use-assignable-roles';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import { ErrorHandler } from '@/lib/error-handler';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface UserEditFormState {
  display_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  /** Not EditableRole: an academy's custom role (TEACHER_1, ...) is valid here. */
  role: string;
}

interface EditableProfileRecord {
  id: string;
  display_name?: string;
  name?: string;
  email?: string | null;
  phone_number?: string;
  is_active?: boolean;
  academy_id?: string | null;
  role?: { name?: string } | null;
  Role?: { name?: string } | null;
  role_name?: string | null;
  role_label?: string | null;
  role_hierarchy_level?: number | null;
}

// Mirrors MANAGER_HIERARCHY_LEVEL in Backend/src/users/users.service.ts.
const MANAGER_HIERARCHY_LEVEL = 3;

/** /profiles/:id returns role_name flat; the list endpoints nest it. */
function getPrimaryRoleName(user: EditableProfileRecord | null): string {
  if (!user) return 'USER';
  return user.role_name || user.role?.name || user.Role?.name || 'USER';
}

export default function UserEditPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useAuthUser();

  const userId = typeof params.id === 'string' ? params.id : '';
  const [targetUser, setTargetUser] = useState<EditableProfileRecord | null>(
    null
  );
  const [form, setForm] = useState<UserEditFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fetchedUserIdRef = useRef<string | null>(null);

  const currentRole = useMemo(
    () => getPrimaryRoleName(targetUser),
    [targetUser]
  );

  const managerAcademyId =
    authUser?.academyId ??
    (authUser?.currentAcademy as { id?: string } | null)?.id ??
    null;

  const canManagerEditDirectProfile = useMemo(() => {
    if (!targetUser || authUser?.role !== 'MANAGER' || !managerAcademyId) {
      return false;
    }

    // Gated by rank, not by role name, so a manager-created custom role
    // (e.g. a "Producer" role at teacher level) is editable too — matches
    // the backend check in UsersService.update.
    const directAcademyId = targetUser.academy_id;
    const directHierarchyLevel = targetUser.role_hierarchy_level;
    return (
      directAcademyId === managerAcademyId &&
      directHierarchyLevel !== null &&
      directHierarchyLevel !== undefined &&
      directHierarchyLevel < MANAGER_HIERARCHY_LEVEL
    );
  }, [authUser?.role, managerAcademyId, targetUser]);

  // Your own record is always yours to edit. The rank rules govern managing
  // OTHER people, and they used to lock a manager out of their own profile.
  // authUser.id is a cuid at runtime, so compare as strings.
  const isSelf = String(authUser?.id ?? '') === userId;

  const canEdit =
    isSelf ||
    authUser?.role === 'ADMIN' ||
    (authUser?.role === 'MANAGER' && canManagerEditDirectProfile);

  const { roles: assignableRoles } = useAssignableRoles(canEdit);

  // The current role can sit outside the assignable list (a peer manager seen by
  // an admin), so it is added back or the select would render empty.
  const roleOptions = useMemo(() => {
    if (assignableRoles.some((role) => role.name === currentRole)) {
      return assignableRoles;
    }
    return [
      {
        id: currentRole,
        name: currentRole,
        label: targetUser?.role_label || getRoleLabel(currentRole, t),
        hierarchy_level: targetUser?.role_hierarchy_level ?? 0
      },
      ...assignableRoles
    ];
  }, [assignableRoles, currentRole, targetUser, t]);

  useEffect(() => {
    if (!userId || fetchedUserIdRef.current === userId) {
      setIsLoading(false);
      return;
    }

    fetchedUserIdRef.current = userId;

    const fetchTargetUser = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProfile(userId);
        const userData = (response as any)?.data || response;
        const normalizedUser = userData as EditableProfileRecord;
        const role = getPrimaryRoleName(normalizedUser);

        setTargetUser(normalizedUser);
        setForm({
          display_name:
            normalizedUser.display_name || normalizedUser.name || '',
          email: normalizedUser.email || '',
          phone_number: normalizedUser.phone_number || '',
          is_active: normalizedUser.is_active ?? false,
          role
        });
      } catch (error) {
        ErrorHandler.handleApiError(error);
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTargetUser();
  }, [router, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !form || !canEdit) return;

    try {
      setIsSaving(true);

      await apiClient.updateUser(targetUser.id, {
        display_name: form.display_name.trim(),
        email: form.email.trim() || undefined,
        phone_number: form.phone_number.trim(),
        // Changing your own status or role is a lockout / privilege change, so
        // it is never sent — the backend rejects it too.
        ...(isSelf ? {} : { is_active: form.is_active })
      });

      const nextRole = assignableRoles.find((role) => role.name === form.role);
      if (!isSelf && nextRole && form.role !== currentRole) {
        await apiClient.assignPlatformRole(nextRole.id, targetUser.id);
      }

      toast.success(t('success.updated'));
      router.push(`/user/${targetUser.id}`);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading || !form) {
    return <LoadingSpinner message={t('common.loadingData')} />;
  }

  if (!canEdit) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('userEdit.accessDeniedTitle')}</CardTitle>
            <CardDescription>
              {t('userEdit.accessDeniedDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/users')}>
              {t('userEdit.backToUsers')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <PageHeader
        title={t('userEdit.title')}
        description={t('userEdit.description')}
      >
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>{t('userEdit.formTitle')}</CardTitle>
          <CardDescription>{t('userEdit.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display_name">
                  {t('userEdit.displayName')}
                </Label>
                <Input
                  id="display_name"
                  value={form.display_name}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, display_name: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('userEdit.role')}</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) =>
                    setForm((prev) => (prev ? { ...prev, role: value } : prev))
                  }
                  disabled={isSaving || isSelf}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">{t('common.phone')}</Label>
                <Input
                  id="phone_number"
                  value={form.phone_number}
                  dir="ltr"
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, phone_number: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('common.status')}</Label>
                <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm((prev) =>
                        prev ? { ...prev, is_active: checked } : prev
                      )
                    }
                    disabled={isSaving || isSelf}
                  />
                  <span className="text-sm">
                    {form.is_active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
