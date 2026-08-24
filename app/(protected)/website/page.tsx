'use client';

import {
  BadgeCheck,
  Building,
  ExternalLink,
  FileText,
  Globe,
  Layout,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import {
  HUB_TONES,
  TintedNavCard
} from '@/components/settings/tinted-nav-card';
import { useSettingsData } from '@/app/(protected)/settings/_hooks/use-settings-data';
import { useTranslation } from '@/lib/i18n/hooks';
import { buildAcademySiteUrl } from '@/lib/website/academy-site-url';

export default function WebsiteHubPage() {
  const { t } = useTranslation();
  const { academy } = useSettingsData();
  const siteUrl = buildAcademySiteUrl(academy);

  const cards = [
    {
      href: '/website/appearance',
      icon: Layout,
      title: t('website.cards.appearanceTitle'),
      description: t('website.cards.appearanceDescription'),
      tone: HUB_TONES.violet
    },
    {
      href: '/website/pages',
      icon: FileText,
      title: t('website.cards.pagesTitle'),
      description: t('website.cards.pagesDescription'),
      tone: HUB_TONES.sky
    },
    {
      href: '/website/seo',
      icon: Search,
      title: t('website.cards.seoTitle'),
      description: t('website.cards.seoDescription'),
      tone: HUB_TONES.amber
    },
    {
      href: '/website/trust',
      icon: BadgeCheck,
      title: t('website.cards.trustTitle'),
      description: t('website.cards.trustDescription'),
      tone: HUB_TONES.emerald
    },
    {
      href: '/website/domain',
      icon: Globe,
      title: t('website.cards.domainTitle'),
      description: t('website.cards.domainDescription'),
      tone: HUB_TONES.teal
    },
    {
      href: '/settings/academy',
      icon: Building,
      title: t('website.cards.brandingTitle'),
      description: t('website.cards.brandingDescription'),
      tone: HUB_TONES.rose
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SettingsSectionHeader
          title={t('website.title')}
          subtitle={t('website.description')}
          scope="academy"
        />
        {siteUrl ? (
          <Button variant="outline" asChild>
            <a href={siteUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="me-2 h-4 w-4" />
              {t('website.viewSite')}
            </a>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <TintedNavCard
            key={card.href}
            href={card.href}
            icon={card.icon}
            title={card.title}
            description={card.description}
            tone={card.tone}
            actionLabel={t('settings.openSettings')}
          />
        ))}
      </div>
    </div>
  );
}
