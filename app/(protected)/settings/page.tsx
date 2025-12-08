'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Palette,
  Shield,
  User,
  Building,
  Layout
} from 'lucide-react';
import { useSettingsData } from './_hooks/use-settings-data';
import { format } from 'date-fns';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SettingsOverviewPage() {
  const { t } = useTranslation();
  const { user, store, isLoading, refresh } = useSettingsData();

  const SECTIONS = [
    {
      title: t('settings.profileSettings'),
      description: t('settings.profileSettingsDescription'),
      href: '/settings/profile',
      icon: User
    },
    {
      title: t('settings.storeSettings'),
      description: t('settings.storeSettingsDescription'),
      href: '/settings/store',
      icon: Building
    },
    {
      title: t('settings.themeBranding'),
      description: t('settings.themeBrandingDescription'),
      href: '/settings/theme',
      icon: Palette
    },
    {
      title: t('settings.uiTemplateBuilder'),
      description: t('settings.uiTemplateBuilderDescription'),
      href: '/settings/ui-template',
      icon: Layout
    },
    {
      title: t('settings.security'),
      description: t('settings.securityDescription'),
      href: '/settings/security',
      icon: Shield
    }
  ] as const;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground">{t('settings.description')}</p>
        </div>
        <Button variant="outline" onClick={refresh}>
          {t('settings.refreshData')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.accountSummary')}</CardTitle>
            <CardDescription>
              {t('settings.accountSummaryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('settings.administrator')}</span>
              <span className="font-medium text-foreground">
                {user?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.email')}</span>
              <span className="font-medium text-foreground">
                {user?.email ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.phone')}</span>
              <span className="font-medium text-foreground">
                {user?.phone_number ?? '—'}
              </span>
            </div>
            {user?.created_at && (
              <div className="flex justify-between">
                <span>{t('settings.joined')}</span>
                <span className="font-medium text-foreground">
                  {format(new Date(user.created_at), 'dd MMM yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.storeSnapshot')}</CardTitle>
            <CardDescription>
              {t('settings.storeSnapshotDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('settings.name')}</span>
              <span className="font-medium text-foreground">
                {store?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.domain')}</span>
              <span className="font-medium text-foreground">
                {store?.private_address ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.students')}</span>
              <span className="font-medium text-foreground">
                {store?.students_count ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.created')}</span>
              <span className="font-medium text-foreground">
                {store?.created_at
                  ? format(new Date(store.created_at), 'dd MMM yyyy')
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map(({ title, description, href, icon: Icon }) => (
          <Card
            key={href}
            className="transition hover:border-primary/50 hover:shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="h-5 w-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" asChild className="px-0 font-medium">
                <Link href={href} className="inline-flex items-center gap-2">
                  {t('settings.openSettings')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
