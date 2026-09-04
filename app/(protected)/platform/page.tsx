'use client';

import Link from 'next/link';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Repeat,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { apiClient, type FlatMetrics } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import { isPlatformOwner } from '@/lib/roles';
import { useMetricsFetch } from './metrics/_hooks/use-metrics-fetch';
import { useMetricFormat } from './metrics/_components/metric-format';

const HEADLINE = [
  { key: 'total_academies', icon: Store, hint: 'active_academies' },
  { key: 'paying_academies', icon: Building2, hint: 'trialing_academies' },
  { key: 'total_users', icon: Users, hint: 'active_last_30d' },
  { key: 'total_courses', icon: BookOpen, hint: 'published_courses' },
  { key: 'mrr', icon: TrendingUp, hint: 'arr' },
  { key: 'gmv_paid_amount', icon: Wallet, hint: 'gmv_paid_count' },
  { key: 'nrr', icon: Repeat, hint: 'monthly_logo_churn' },
  { key: 'learning_records', icon: GraduationCap, hint: 'mau' }
] as const;

export default function PlatformOverviewPage() {
  const { t } = useTranslation();
  const format = useMetricFormat('TOMAN');
  const { user, isLoading: userLoading } = useAuthUser();
  const { data, loading } = useMetricsFetch({}, (query) =>
    apiClient.getMetricsOverview(query)
  );
  const metrics: FlatMetrics = data?.metrics ?? {};

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

  if (userLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            {t('platform.overview.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <PageHeader
        title={t('platform.overview.title')}
        description={t('platform.overview.description')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HEADLINE.map(({ key, icon, hint }) => (
          <StatsCard
            key={key}
            title={t(`platformMetrics.metrics.${key}`)}
            value={format(key, metrics[key] ?? null)}
            icon={icon}
            description={`${t(`platformMetrics.metrics.${hint}`)}: ${format(hint, metrics[hint] ?? null)}`}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/platform/academies" className="block">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('platform.overview.allSchools')}
              </CardTitle>
              <CardDescription>
                {t('platform.overview.allSchoolsDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/platform/users" className="block">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('platform.overview.platformUsers')}
              </CardTitle>
              <CardDescription>
                {t('platform.overview.platformUsersDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/platform/metrics" className="block">
          <Card className="h-full transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('platform.overview.platformAnalytics')}
              </CardTitle>
              <CardDescription>
                {t('platform.overview.platformAnalyticsDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('platform.overview.quickActions')}</CardTitle>
          <CardDescription>
            {t('platform.overview.quickActionsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/platform/academies"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Store className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.manageSchools')}
              </span>
            </Link>
            <Link
              href="/platform/users"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <Users className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.allUsers')}
              </span>
            </Link>
            <Link
              href="/platform/metrics"
              className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <TrendingUp className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {t('platform.overview.platformAnalyticsLink')}
              </span>
            </Link>
            {isPlatformOwner(user) ? (
              <Link
                href="/platform/roles"
                className="flex flex-col items-center justify-center rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <ShieldCheck className="mb-2 h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{t('roles.title')}</span>
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
