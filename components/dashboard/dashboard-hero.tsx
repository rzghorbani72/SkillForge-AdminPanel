'use client';

import { StatCard } from './StatsCards';
import { DashboardHeroSlideshow } from './dashboard-hero-slideshow';
import { DashboardStatsCard } from './useDashboard';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';

/** Media ids are served relative in some environments and absolute in others. */
const absoluteUrl = (url?: string | null) =>
  url ? (url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}` : url) : null;

type Props = {
  cards: DashboardStatsCard[];
  period: string;
  isLoading: boolean;
  loadingLabel: string;
};

/**
 * Mildly rectangular banner in the centre, with the four learning metrics
 * stacked beside it so the row reads as one composition. Charts stay in their
 * own section.
 */
export default function DashboardHero({
  cards,
  period: _period,
  isLoading,
  loadingLabel: _loadingLabel,
}: Props) {
  const academy = useCurrentAcademy();
  const { t, language } = useTranslation();
  const isFa = language === 'fa';
  const logoUrl = absoluteUrl(academy?.logo?.publicUrl);
  const [left, right] = [cards.slice(0, 2), cards.slice(2, 4)];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{t('dashboard.learningRow')}</h2>

      <div className="grid gap-3 lg:grid-cols-[0.85fr_1fr_0.85fr] lg:items-stretch">
        <div className="hero-in hero-in-start flex flex-col gap-3">
          {left.map((card) => (
            <StatCard
              key={card.title}
              card={card}
              isLoading={isLoading}
              className="min-h-0 flex-1"
              compact
            />
          ))}
        </div>

        <div className="dashboard-card relative order-first aspect-[5/4] w-full overflow-hidden lg:order-none">
          <DashboardHeroSlideshow>
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 p-6 text-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={academy?.name ?? ''}
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-muted text-2xl font-semibold text-primary sm:h-24 sm:w-24">
                  {academy?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="min-w-0 px-2">
                <h3 className="truncate text-base font-semibold sm:text-lg">
                  {academy?.name ?? (isFa ? 'آکادمی شما' : 'Your academy')}
                </h3>
                {academy?.domain?.public_address ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {academy.domain.public_address}
                  </p>
                ) : null}
              </div>
            </div>
          </DashboardHeroSlideshow>
        </div>

        <div className="hero-in hero-in-end flex flex-col gap-3">
          {right.map((card) => (
            <StatCard
              key={card.title}
              card={card}
              isLoading={isLoading}
              className="min-h-0 flex-1"
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
