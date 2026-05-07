'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { User } from '@/types/api';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { getRoleColor, getStatusColor } from '@/components/shared/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Clock,
  Activity
} from 'lucide-react';

export default function UserDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || lastFetchedUserIdRef.current === userId) {
      return;
    }

    lastFetchedUserIdRef.current = userId;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getUser(Number(userId));

        if (response) {
          // Handle different response shapes
          const userData = (response as any)?.data || response;
          setUser(userData);
        } else {
          toast.error(t('userDetails.userNotFound'));
          router.push('/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error(t('userDetails.failedToLoadUserDetails'));
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, router, t]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const profiles = user.profiles || [];
  const userStatus = user.status || (user.is_active ? 'ACTIVE' : 'INACTIVE');
  const avatarUrl = profiles[0]?.avatar?.publicUrl;
  const displayName = user.display_name ?? user.name ?? 'User';

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={t('userDetails.title')}
        description={t('userDetails.description')}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button onClick={() => router.push(`/user/${userId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('userDetails.editUser')}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{displayName}</CardTitle>
            <CardDescription>
              <Badge
                variant="outline"
                className={`${getStatusColor(userStatus)} mt-2`}
              >
                {userStatus}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{user.email}</p>
                    {user.email_confirmed ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3" />{' '}
                        {t('userDetails.verified')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <XCircle className="h-3 w-3" />{' '}
                        {t('userDetails.notVerified')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{user.phone_number}</p>
                  {user.phone_confirmed ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />{' '}
                      {t('userDetails.verified')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <XCircle className="h-3 w-3" />{' '}
                      {t('userDetails.notVerified')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">
                    {t('userDetails.joined')}{' '}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {user.birthday && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      {t('userDetails.birthday')}:{' '}
                      {new Date(user.birthday).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Details Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('userDetails.userInformation')}</CardTitle>
            <CardDescription>
              {t('userDetails.userInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profiles" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profiles">
                  <Shield className="mr-2 h-4 w-4" />
                  {t('userDetails.profiles')}
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="mr-2 h-4 w-4" />
                  {t('userDetails.activity')}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('userDetails.settings')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profiles" className="mt-4">
                {profiles.length === 0 ? (
                  <div className="py-8 text-center">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">
                      {t('userDetails.noProfiles')}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('userDetails.noProfilesDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <Card
                        key={profile.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {profile.display_name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={getRoleColor(
                                    profile.Role?.name ??
                                      profile.role?.name ??
                                      ''
                                  )}
                                >
                                  {profile.Role?.name ??
                                    profile.role?.name ??
                                    ''}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>
                                  {profile.academy?.name ??
                                    profile.store?.name ??
                                    '—'}
                                </span>
                              </div>
                              {profile.bio && (
                                <p className="text-sm text-muted-foreground">
                                  {profile.bio}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                profile.is_active ? 'default' : 'secondary'
                              }
                            >
                              {profile.is_active
                                ? t('common.active')
                                : t('common.inactive')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="py-8 text-center">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    {t('userDetails.activityLog')}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('userDetails.activityLogDescription')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">
                      {t('userDetails.accountStatus')}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('userDetails.currentStatus')}: {userStatus}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">
                        {t('userDetails.suspendUser')}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {t('userDetails.banUser')}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">
                      {t('userDetails.accountInformation')}
                    </h4>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('userDetails.userId')}
                        </span>
                        <span className="font-mono">{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('userDetails.created')}
                        </span>
                        <span>
                          {new Date(user.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('userDetails.lastUpdated')}
                        </span>
                        <span>
                          {new Date(user.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
