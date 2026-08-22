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
import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
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
      description: t('website.cards.appearanceDescription')
    },
    {
      href: '/website/pages',
      icon: FileText,
      title: t('website.cards.pagesTitle'),
      description: t('website.cards.pagesDescription')
    },
    {
      href: '/website/seo',
      icon: Search,
      title: t('website.cards.seoTitle'),
      description: t('website.cards.seoDescription')
    },
    {
      href: '/website/trust',
      icon: BadgeCheck,
      title: t('website.cards.trustTitle'),
      description: t('website.cards.trustDescription')
    },
    {
      href: '/website/domain',
      icon: Globe,
      title: t('website.cards.domainTitle'),
      description: t('website.cards.domainDescription')
    },
    {
      href: '/settings/academy',
      icon: Building,
      title: t('website.cards.brandingTitle'),
      description: t('website.cards.brandingDescription')
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

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.href}
              className="transition hover:border-primary/50 hover:shadow-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Icon className="h-5 w-5" />
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" asChild className="px-0 font-medium">
                  <Link href={card.href}>{t('settings.openSettings')}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
