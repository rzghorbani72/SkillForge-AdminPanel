'use client';

import {
  Building,
  CreditCard,
  Layers,
  Layout,
  Shield,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScopeBadge } from '@/components/settings/scope-badge';
import {
  HUB_TONES,
  TintedNavCard,
  type HubCardTone
} from '@/components/settings/tinted-nav-card';
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
  tone: HubCardTone;
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

  return (
    <TintedNavCard
      href={item.href}
      icon={item.icon}
      title={item.title}
      description={item.description}
      tone={item.tone}
      actionLabel={t('settings.openSettings')}
      badge={<ScopeBadge scope={item.scope} showTooltip={false} />}
    />
  );
}

function PlatformPlanCard() {
  const { t } = useTranslation();
  const { planName, status, daysRemaining, isLoading } =
    useAcademySubscription(true);

  return (
    <TintedNavCard
      href="/plans"
      icon={Zap}
      title={t('settings.platformPlanTitle')}
      description={t('settings.platformPlanDescription')}
      tone={HUB_TONES.violet}
      actionLabel={t('settings.managePlatformPlan')}
      badge={<ScopeBadge scope="platform" showTooltip={false} />}
    >
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
            <span className="font-medium text-foreground">{status ?? '—'}</span>
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
    </TintedNavCard>
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
        scope: 'personal',
        tone: HUB_TONES.sky
      },
      {
        title: t('settings.security'),
        description: t('settings.securityDescription'),
        href: '/settings/security',
        icon: Shield,
        scope: 'personal',
        tone: HUB_TONES.amber
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
            scope: 'platform',
            tone: HUB_TONES.violet
          },
          {
            title: t('settings.paymentGatewayTitle'),
            description: t('settings.paymentGatewayDescription'),
            href: '/settings/payment-gateway',
            icon: CreditCard,
            scope: 'platform',
            tone: HUB_TONES.teal
          }
        ]
      : [
          {
            title: t('settings.storeSettings'),
            description: t('settings.storeSettingsPlatformDescription'),
            href: '/settings/academy',
            icon: Building,
            scope: 'platform',
            tone: HUB_TONES.rose
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
            title: t('website.title'),
            description: t('website.description'),
            href: '/website',
            icon: Layout,
            scope: 'academy',
            tone: HUB_TONES.indigo
          },
          {
            title: t('settings.studentPlansTitle'),
            description: t('settings.studentPlansDescription'),
            href: '/plans?tab=academy',
            icon: Layers,
            scope: 'academy',
            tone: HUB_TONES.emerald
          },
          {
            title: t('roles.title'),
            description: t('roles.description'),
            href: '/settings/roles',
            icon: ShieldCheck,
            scope: 'academy',
            tone: HUB_TONES.amber
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
