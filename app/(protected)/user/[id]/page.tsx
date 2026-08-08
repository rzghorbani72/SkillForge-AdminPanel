'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { UserRowActions } from '@/components/users/user-row-actions';
import { UserContactActions } from '@/components/users/user-contact-actions';
import {
  UserEnrollmentsCard,
  UserPaymentsCard
} from '@/components/users/user-activity-panel';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { getRoleLabel } from '@/lib/i18n/role-label';
import type { User } from '@/types/api';
import type { UserDetailsResponse } from '@/types/user-details';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  CheckCircle2,
  XCircle
} from 'lucide-react';

/** The flat shape /users/:id actually returns — never a nested user+profiles. */
type ProfileDetail = User & {
  academy_name?: string | null;
  last_login?: string | null;
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** The API sends nulls and the odd unparsable value; never render "Invalid Date". */
function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return withTime
    ? date.toLocaleString('fa-IR')
    : date.toLocaleDateString('fa-IR');
}

function VerifiedMark({
  confirmed,
  t
}: {
  confirmed?: boolean;
  t: (k: string) => string;
}) {
  return confirmed ? (
    <span className="flex items-center gap-1 text-xs text-emerald-600">
      <CheckCircle2 className="h-3 w-3" /> {t('userDetails.verified')}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <XCircle className="h-3 w-3" /> {t('userDetails.notVerified')}
    </span>
  );
}

export default function UserDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuthUser();
  const userId = typeof params.id === 'string' ? params.id : '';

  const [user, setUser] = useState<ProfileDetail | null>(null);
  const [details, setDetails] = useState<UserDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchedRef = useRef<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = (await apiClient.getUser(userId)) as unknown as {
        status?: string;
        data?: ProfileDetail;
      } | null;

      // This endpoint answers 200 with {status:'fail'} instead of throwing, so
      // a missing or out-of-scope profile has to be detected, not caught.
      const payload = (response?.data ?? response) as ProfileDetail | undefined;
      if (!response || response.status === 'fail' || !payload?.id) {
        setUser(null);
        return;
      }
      setUser(payload);

      // Enrollments/purchases are a second, heavier call: a failure here must
      // leave the profile card usable rather than blanking the whole page.
      try {
        setDetails(await apiClient.getUserDetails(userId));
      } catch {
        setDetails(null);
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (lastFetchedRef.current === userId) return;
    lastFetchedRef.current = userId;
    fetchUser();
  }, [userId, fetchUser]);

  if (isLoading) {
    return <LoadingSpinner message={t('userDetails.loadingUserDetails')} />;
  }

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {t('userDetails.userNotFound')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('userDetails.userNotFoundDescription')}
          </p>
          <Button className="mt-4" onClick={() => router.push('/users')}>
            {t('userDetails.backToUsers')}
          </Button>
        </div>
      </div>
    );
  }

  const displayName = user.display_name || user.name || '—';
  const roleName = user.role_name ?? '';
  const translatedRole = getRoleLabel(roleName, t);
  // Custom roles have no translation key, so fall back to their stored label.
  const roleLabel =
    roleName && translatedRole === roleName
      ? user.role_label || roleName
      : translatedRole;

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={t('userDetails.title')}
        description={t('userDetails.description')}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="me-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <UserContactActions
            email={user.email}
            phoneNumber={user.phone_number}
          />
          <Button onClick={() => router.push(`/user/${userId}/edit`)}>
            <Edit className="me-2 h-4 w-4" />
            {t('userDetails.editUser')}
          </Button>
          <UserRowActions
            user={user}
            targetLevel={user.role_hierarchy_level}
            callerRole={authUser?.role}
            isSelf={String(authUser?.id) === String(user.id)}
            onChanged={fetchUser}
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{displayName}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 pt-2">
              <Badge variant="secondary">{roleLabel}</Badge>
              <Badge variant={user.is_active ? 'default' : 'outline'}>
                {user.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{user.email}</p>
                    <VerifiedMark confirmed={user.email_confirmed} t={t} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm" dir="ltr">
                    {user.phone_number || '—'}
                  </p>
                  <VerifiedMark confirmed={user.phone_confirmed} t={t} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">
                  {t('userDetails.joined')} {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('userDetails.userInformation')}</CardTitle>
            <CardDescription>
              {t('userDetails.userInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-3 w-3" /> {t('userEdit.role')}
                </div>
                <p className="text-sm font-medium">{roleLabel}</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Building2 className="h-3 w-3" /> {t('userDetails.academy')}
                </div>
                <p className="text-sm font-medium">
                  {user.academy_name || '—'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium">
                {t('userDetails.accountInformation')}
              </h4>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {t('userDetails.userId')}
                  </span>
                  <span className="truncate font-mono text-xs" dir="ltr">
                    {user.id}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {t('userDetails.created')}
                  </span>
                  <span>{formatDate(user.created_at, true)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    {t('userDetails.lastUpdated')}
                  </span>
                  <span>{formatDate(user.updated_at, true)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UserEnrollmentsCard enrollments={details?.enrollments ?? []} />
        <UserPaymentsCard payments={details?.purchase_history ?? []} />
      </div>
    </div>
  );
}
