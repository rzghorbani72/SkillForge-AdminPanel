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

const SECTIONS = [
  {
    title: 'Profile Settings',
    description:
      'Update your personal details, avatar, and contact information.',
    href: '/settings/profile',
    icon: User
  },
  {
    title: 'School Settings',
    description:
      'Manage your school name, description, and domain configuration.',
    href: '/settings/school',
    icon: Building
  },
  {
    title: 'Theme & Branding',
    description:
      'Customize colours, logos, and visual appearance for students.',
    href: '/settings/theme',
    icon: Palette
  },
  {
    title: 'UI Template Builder',
    description:
      'Customize the layout, visibility, and configuration of UI blocks on your school website.',
    href: '/settings/ui-template',
    icon: Layout
  },
  {
    title: 'Security',
    description:
      'Change passwords, enable two-factor authentication, and manage notifications.',
    href: '/settings/security',
    icon: Shield
  }
] as const;

export default function SettingsOverviewPage() {
  const { user, school, isLoading, refresh } = useSettingsData();

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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, school configuration, branding, and security
            preferences.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>
              Key information for your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Administrator</span>
              <span className="font-medium text-foreground">
                {user?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email</span>
              <span className="font-medium text-foreground">
                {user?.email ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phone</span>
              <span className="font-medium text-foreground">
                {user?.phone_number ?? '—'}
              </span>
            </div>
            {user?.created_at && (
              <div className="flex justify-between">
                <span>Joined</span>
                <span className="font-medium text-foreground">
                  {format(new Date(user.created_at), 'dd MMM yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Snapshot</CardTitle>
            <CardDescription>
              Your primary school on SkillForge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Name</span>
              <span className="font-medium text-foreground">
                {school?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Domain</span>
              <span className="font-medium text-foreground">
                {school?.private_address ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Students</span>
              <span className="font-medium text-foreground">
                {school?.students_count ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span className="font-medium text-foreground">
                {school?.created_at
                  ? format(new Date(school.created_at), 'dd MMM yyyy')
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
                  Open settings
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
