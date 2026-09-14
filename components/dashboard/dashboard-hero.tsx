'use client';

import { DashboardHeroSlideshow } from './dashboard-hero-slideshow';
import { StatCard } from './StatsCards';
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
 * Hero row: two stacked cards, the academy's identity panel, two stacked cards.
 * The centre block is one tall panel rather than a pair, so the row reads as a
 * single composition instead of six equal tiles.
 */
export default function DashboardHero({ cards, period, isLoading, loadingLabel }: Props) {
  const academy = useCurrentAcademy();
  const { language } = useTranslation();
  const isFa = language === 'fa';
  const logoUrl = absoluteUrl(academy?.logo?.publicUrl);
  const [left, right] = [cards.slice(0, 2), cards.slice(2, 4)];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
      <div className="hero-in hero-in-start flex flex-col gap-4">
        {left.map((card, i) => (
          <StatCard
            key={card.title}
            card={card}
            index={i}
            period={period}
            isLoading={isLoading}
            loadingLabel={loadingLabel}
          />
        ))}
      </div>

      <div className="hero-media hero-in relative order-first min-h-[220px] lg:order-none">
        <DashboardHeroSlideshow>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={academy?.name ?? ''}
              className="h-24 w-24 rounded-3xl object-cover shadow-lg"
            />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/70 text-3xl font-bold text-primary shadow-lg">
              {academy?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <h2 className="mt-4 text-lg font-bold">
            {academy?.name ?? (isFa ? 'آکادمی شما' : 'Your academy')}
          </h2>
          {academy?.domain?.public_address && (
            <p className="mt-1 text-xs text-muted-foreground">{academy.domain.public_address}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-[11px] font-semibold text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--viz-accent))]" />
            {isFa ? 'فعال' : 'Active'}
          </span>
        </DashboardHeroSlideshow>
      </div>

      <div className="hero-in hero-in-end flex flex-col gap-4">
        {right.map((card, i) => (
          <StatCard
            key={card.title}
            card={card}
            index={i + 2}
            period={period}
            isLoading={isLoading}
            loadingLabel={loadingLabel}
          />
        ))}
      </div>
    </div>
  );
}
