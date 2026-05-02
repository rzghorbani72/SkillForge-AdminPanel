'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  Building2,
  Store,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function PlatformOverviewPage() {
  const { t, language } = useTranslation();
  const { user, isLoading: userLoading } = useAuthUser();
  const [stats, setStats] = useState({
    totalStores: 0,
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeStores: 0,
    totalStudents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setIsLoading(true);
        // Fetch platform-level statistics
        // TODO: Create backend endpoint for platform stats
        // For now, using placeholder data
        const [storesRaw, usersRaw, coursesBundle] = await Promise.all([
          apiClient.getAcademies().catch(() => null),
          apiClient.getUsers({ limit: 1000 }).catch(() => null),
          apiClient.getCourses({ limit: 1000 }).catch(() => ({
            courses: [] as unknown[]
          }))
        ]);

        const academyRows = Array.isArray(storesRaw)
          ? storesRaw
          : storesRaw &&
              typeof storesRaw === 'object' &&
              Array.isArray((storesRaw as { items?: unknown[] }).items)
            ? (storesRaw as { items: unknown[] }).items
            : storesRaw &&
                typeof storesRaw === 'object' &&
                Array.isArray((storesRaw as { data?: unknown[] }).data)
              ? (storesRaw as { data: unknown[] }).data
              : [];

        const userRows = Array.isArray(usersRaw)
          ? usersRaw
          : usersRaw &&
              typeof usersRaw === 'object' &&
              Array.isArray((usersRaw as { users?: unknown[] }).users)
            ? (usersRaw as { users: unknown[] }).users
            : usersRaw &&
                typeof usersRaw === 'object' &&
                Array.isArray((usersRaw as { items?: unknown[] }).items)
              ? (usersRaw as { items: unknown[] }).items
              : [];

        const courseRows = coursesBundle?.courses ?? [];

        setStats({
          totalStores: academyRows.length,
          totalUsers: userRows.length,
          totalCourses: courseRows.length,
          totalRevenue: 0, // TODO: Calculate from all stores
          activeStores: academyRows.filter(
            (s) => (s as { is_active?: boolean }).is_active
          ).length,
          totalStudents: 0 // TODO: Calculate from all stores
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!userLoading && user?.isAdminProfile) {
      fetchPlatformStats();
    }
  }, [user, userLoading]);

  // Redirect if not platform-level admin
  if (!userLoading && user && !user.isAdminProfile && !user.platformLevel) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('platform.overview.accessDenied')}</CardTitle>
            <CardDescription>
              {t('platform.overview.accessDeniedDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('platform.overview.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('platform.overview.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('platform.overview.description')}
          </p>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.overview.totalSchools')}
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              {t('platform.overview.activeSchools', {
                count: stats.activeStores
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.overview.totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('platform.overview.acrossAllSchools')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.overview.totalCourses')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {t('platform.overview.platformWideCourses')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('platform.overview.platformRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('platform.overview.allTimeRevenue')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Management Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('platform.overview.allSchools')}
            </CardTitle>
            <CardDescription>
              {t('platform.overview.allSchoolsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('platform.overview.allSchoolsAccess')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('platform.overview.platformUsers')}
            </CardTitle>
            <CardDescription>
              {t('platform.overview.platformUsersDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('platform.overview.platformUsersAccess')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('platform.overview.platformAnalytics')}
            </CardTitle>
            <CardDescription>
              {t('platform.overview.platformAnalyticsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('platform.overview.platformAnalyticsAccess')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('platform.overview.quickActions')}</CardTitle>
          <CardDescription>
            {t('platform.overview.quickActionsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/platform/stores"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Store className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.manageSchools')}
              </span>
            </a>
            <a
              href="/users/admins"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Users className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.manageAdmins')}
              </span>
            </a>
            <a
              href="/users"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Users className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.allUsers')}
              </span>
            </a>
            <a
              href="/analytics"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <TrendingUp className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.platformAnalyticsLink')}
              </span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
