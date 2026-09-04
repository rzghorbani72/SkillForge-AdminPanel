'use client';

import type { ReactNode } from 'react';
import { useDashboardHeroBanners } from './use-dashboard-hero-banners';

type Props = {
  children: ReactNode;
};

export function DashboardHeroSlideshow({ children }: Props) {
  const { urls, active } = useDashboardHeroBanners();

  if (urls.length === 0) return <>{children}</>;

  return (
    <div className="absolute inset-0">
      {urls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: index === active ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
