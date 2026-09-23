'use client';

import { Building, CreditCard, HardDrive, Shield, ShieldCheck, User } from 'lucide-react';
import { ScopeBadge } from '@/components/settings/scope-badge';
import {
  HUB_TONES,
  HubCardGrid,
  TintedNavCard,
  type HubCardTone,
} from '@/components/settings/tinted-nav-card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SettingsScope } from '@/lib/settings-scope';
import type { LucideIcon } from 'lucide-react';

type HubItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
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
    />
  );
}

function HubSection({ group }: { group: HubGroup }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <ScopeBadge scope={group.scope} />
        </div>
        <p className="text-sm text-muted-foreground">{group.description}</p>
      </div>
      <HubCardGrid>
        {group.items.map((item) => (
          <HubCard key={item.href} item={item} />
        ))}
      </HubCardGrid>
    </section>
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
        tone: HUB_TONES.sky,
      },
      {
        title: t('settings.security'),
        description: t('settings.securityDescription'),
        href: '/settings/security',
        icon: Shield,
        tone: HUB_TONES.amber,
      },
    ],
  };

  if (isPlatformAdmin) {
    const platformGroup: HubGroup = {
      title: t('settings.groupPlatform'),
      description: t('settings.groupPlatformDescription'),
      scope: 'platform',
      items: [
        {
          title: t('settings.platformPricingTitle'),
          description: t('settings.platformPricingDescription'),
          href: '/platform/pricing',
          icon: Building,
          tone: HUB_TONES.violet,
        },
        {
          title: t('settings.paymentGatewayTitle'),
          description: t('settings.paymentGatewayDescription'),
          href: '/settings/payment-gateway',
          icon: CreditCard,
          tone: HUB_TONES.teal,
        },
      ],
    };

    return (
      <div className="space-y-8">
        {[personalGroup, platformGroup].map((group) => (
          <HubSection key={group.scope} group={group} />
        ))}
      </div>
    );
  }

  const academyGroup: HubGroup = {
    title: t('settings.groupAcademy'),
    description: t('settings.groupAcademyDescription'),
    scope: 'academy',
    items: [
      {
        title: t('settings.storeSettings'),
        description: t('settings.storeSettingsPlatformDescription'),
        href: '/settings/academy',
        icon: Building,
        tone: HUB_TONES.rose,
      },
      {
        title: t('navigation.storage'),
        description: t('settings.storageHubDescription'),
        href: '/settings/storage',
        icon: HardDrive,
        tone: HUB_TONES.teal,
      },
      {
        title: t('roles.title'),
        description: t('roles.description'),
        href: '/settings/roles',
        icon: ShieldCheck,
        tone: HUB_TONES.amber,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {[personalGroup, academyGroup].map((group) => (
        <HubSection key={`${group.scope}-${group.title}`} group={group} />
      ))}
    </div>
  );
}
