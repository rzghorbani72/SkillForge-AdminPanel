'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
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
import { toast } from 'sonner';

type EditableRole = 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'USER';

interface UserEditFormState {
  display_name: string;
  email: string;
  phone_number: string;
  birthday: string;
  is_active: boolean;
  role: EditableRole;
}

interface EditableProfileRecord {
  id: number;
  display_name?: string;
  name?: string;
  email?: string | null;
  phone_number?: string;
  birthday?: string | null;
  is_active?: boolean;
  academy_id?: number | null;
  role?: { name?: EditableRole } | null;
  Role?: { name?: EditableRole } | null;
}

const ADMIN_EDITABLE_ROLES: EditableRole[] = [
  'ADMIN',
  'MANAGER',
  'TEACHER',
  'STUDENT',
  'USER'
];
const MANAGER_EDITABLE_ROLES: EditableRole[] = ['TEACHER', 'STUDENT'];

function getPrimaryRole(user: EditableProfileRecord | null): EditableRole {
  if (!user) return 'USER';
  const roleName = (user as any)?.role?.name || (user as any)?.Role?.name;
  return (roleName as EditableRole) || 'USER';
}

export default function UserEditPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useAuthUser();

  const userId = Number(params.id);
  const [targetUser, setTargetUser] = useState<EditableProfileRecord | null>(
    null
  );
  const [form, setForm] = useState<UserEditFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fetchedUserIdRef = useRef<number | null>(null);

  const currentRole = useMemo(() => getPrimaryRole(targetUser), [targetUser]);

  const managerAcademyId =
    authUser?.academyId ??
    (authUser?.currentAcademy as { id?: number } | null)?.id ??
    null;

  const canManagerEditTarget = useMemo(() => {
    return false;
  }, []);

  const canManagerEditDirectProfile = useMemo(() => {
    if (!targetUser || authUser?.role !== 'MANAGER' || !managerAcademyId) {
      return false;
    }

    const directRole = getPrimaryRole(targetUser);
    const directAcademyId = targetUser.academy_id;
    return (
      directAcademyId === managerAcademyId &&
      (directRole === 'STUDENT' || directRole === 'TEACHER')
    );
  }, [authUser?.role, managerAcademyId, targetUser]);

  const canEdit =
    authUser?.role === 'ADMIN' ||
    (authUser?.role === 'MANAGER' &&
      (canManagerEditTarget || canManagerEditDirectProfile));

  const editableRoles =
    authUser?.role === 'ADMIN' ? ADMIN_EDITABLE_ROLES : MANAGER_EDITABLE_ROLES;

  useEffect(() => {
    if (
      !userId ||
      Number.isNaN(userId) ||
      fetchedUserIdRef.current === userId
    ) {
      return;
    }

    fetchedUserIdRef.current = userId;

    const fetchTargetUser = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProfile(userId);
        const userData = (response as any)?.data || response;
        const normalizedUser = userData as EditableProfileRecord;
        const role = getPrimaryRole(normalizedUser);

        setTargetUser(normalizedUser);
        setForm({
          display_name:
            normalizedUser.display_name || normalizedUser.name || '',
          email: normalizedUser.email || '',
          phone_number: normalizedUser.phone_number || '',
          birthday: normalizedUser.birthday
            ? new Date(normalizedUser.birthday).toISOString().split('T')[0]
            : '',
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
        email: form.email.trim() || null,
        phone_number: form.phone_number.trim(),
        birthday: form.birthday || null,
        is_active: form.is_active
      });

      if (form.role !== currentRole) {
        await apiClient.changeUserRole(targetUser.id, form.role);
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
      <div className="flex-1 space-y-6 p-6">
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
    <div className="flex-1 space-y-6 p-6">
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
                    setForm((prev) =>
                      prev ? { ...prev, role: value as EditableRole } : prev
                    )
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
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
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, phone_number: e.target.value } : prev
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">{t('userEdit.birthday')}</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev ? { ...prev, birthday: e.target.value } : prev
                    )
                  }
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
                    disabled={isSaving}
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
