'use client';

import Link from '@/components/ui/link';
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
  Building,
  CreditCard,
  Layers,
  Layout,
  FileText,
  BadgeCheck,
  Globe,
  Shield,
  User,
  Zap
} from 'lucide-react';
import { ScopeBadge } from '@/components/settings/scope-badge';
import { useAcademySubscription } from '@/hooks/use-academy-subscription';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettingsScope } from '@/lib/settings-scope';
import type { LucideIcon } from 'lucide-react';

type HubItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  scope: SettingsScope;
};

type HubGroup = {
  title: string;
  description: string;
  scope: SettingsScope;
  items: HubItem[];
};

type SettingsHubGroupsProps = {
  isPlatformAdmin: boolean;
};

function HubCard({ item }: { item: HubItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <Card className="transition hover:border-primary/50 hover:shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Icon className="h-5 w-5" />
            {item.title}
          </CardTitle>
          <ScopeBadge scope={item.scope} showTooltip={false} />
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="link" asChild className="px-0 font-medium">
          <Link href={item.href} className="inline-flex items-center gap-2">
            {t('settings.openSettings')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PlatformPlanCard() {
  const { t } = useTranslation();
  const { planName, status, daysRemaining, isLoading } =
    useAcademySubscription(true);

  return (
    <Card className="border-violet-200/60 transition hover:border-violet-300 hover:shadow-sm dark:border-violet-800/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-5 w-5 text-violet-600" />
            {t('settings.platformPlanTitle')}
          </CardTitle>
          <ScopeBadge scope="platform" showTooltip={false} />
        </div>
        <CardDescription>
          {t('settings.platformPlanDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('settings.subscriptionPlan')}</span>
              <span className="font-medium capitalize text-foreground">
                {planName ?? t('settings.noPlan')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('settings.subscriptionStatus')}</span>
              <span className="font-medium text-foreground">
                {status ?? '—'}
              </span>
            </div>
            {daysRemaining != null ? (
              <div className="flex justify-between">
                <span>{t('settings.daysRemaining')}</span>
                <span className="font-medium text-foreground">
                  {daysRemaining}
                </span>
              </div>
            ) : null}
          </div>
        )}
        <Button variant="link" asChild className="px-0 font-medium">
          <Link href="/plans" className="inline-flex items-center gap-2">
            {t('settings.managePlatformPlan')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function SettingsHubGroups({ isPlatformAdmin }: SettingsHubGroupsProps) {
  const { t } = useTranslation();

  const personalGroup: HubGroup = {
    title: t('settings.groupPersonal'),
    description: t('settings.groupPersonalDescription'),
    scope: 'personal',
    items: [
      {
        title: t('settings.profileSettings'),
        description: t('settings.profileSettingsDescription'),
        href: '/settings/profile',
        icon: User,
        scope: 'personal'
      },
      {
        title: t('settings.security'),
        description: t('settings.securityDescription'),
        href: '/settings/security',
        icon: Shield,
        scope: 'personal'
      }
    ]
  };

  const platformGroup: HubGroup = {
    title: t('settings.groupPlatform'),
    description: t('settings.groupPlatformDescription'),
    scope: 'platform',
    items: isPlatformAdmin
      ? [
          {
            title: t('settings.platformPricingTitle'),
            description: t('settings.platformPricingDescription'),
            href: '/platform/pricing',
            icon: Building,
            scope: 'platform'
          },
          {
            title: t('settings.paymentGatewayTitle'),
            description: t('settings.paymentGatewayDescription'),
            href: '/settings/payment-gateway',
            icon: CreditCard,
            scope: 'platform'
          }
        ]
      : [
          {
            title: t('settings.storeSettings'),
            description: t('settings.storeSettingsPlatformDescription'),
            href: '/settings/academy',
            icon: Building,
            scope: 'platform'
          }
        ]
  };

  const academyGroup: HubGroup = {
    title: t('settings.groupAcademy'),
    description: t('settings.groupAcademyDescription'),
    scope: 'academy',
    items: isPlatformAdmin
      ? []
      : [
          {
            title: t('settings.uiTemplateBuilder'),
            description: t('settings.uiTemplateBuilderDescription'),
            href: '/settings/ui-template',
            icon: Layout,
            scope: 'academy'
          },
          {
            title: t('settings.sitePages.title'),
            description: t('settings.sitePages.description'),
            href: '/settings/site-pages',
            icon: FileText,
            scope: 'academy'
          },
          {
            title: t('settings.studentPlansTitle'),
            description: t('settings.studentPlansDescription'),
            href: '/plans?tab=academy',
            icon: Layers,
            scope: 'academy'
          },
          {
            title: t('settings.domainDns.title'),
            description: t('settings.domainDns.description'),
            href: '/settings/domain',
            icon: Globe,
            scope: 'academy'
          },
          {
            title: t('compliance.enamad.title'),
            description: t('compliance.enamad.description'),
            href: '/settings/compliance',
            icon: BadgeCheck,
            scope: 'academy'
          }
        ]
  };

  const groups = [personalGroup, platformGroup, academyGroup].filter(
    (group) => group.items.length > 0 || group.scope === 'platform'
  );

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.scope} className="space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <ScopeBadge scope={group.scope} />
            </div>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {group.items.map((item) => (
              <HubCard key={item.href} item={item} />
            ))}
            {!isPlatformAdmin && group.scope === 'platform' ? (
              <PlatformPlanCard />
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
