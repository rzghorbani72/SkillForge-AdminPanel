'use client';

import type { ReactNode } from 'react';
import { useDashboardHeroBanners } from './use-dashboard-hero-banners';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  children: ReactNode;
};

export function DashboardHeroSlideshow({ children }: Props) {
  const { t } = useTranslation();
  const { urls, active, select, setPaused } = useDashboardHeroBanners();

  if (urls.length === 0) return <>{children}</>;

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {urls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          aria-hidden={index !== active}
          className="duration-[1200ms] absolute inset-0 h-full w-full object-cover transition-[opacity,transform] ease-out"
          style={{
            opacity: index === active ? 1 : 0,
            transform: index === active ? 'scale(1)' : 'scale(1.04)'
          }}
        />
      ))}

      {urls.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
          <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
            {urls.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={t('dashboardBanners.goToSlide', {
                  number: index + 1
                })}
                aria-current={index === active}
                onClick={() => select(index)}
                className={`h-1.5 rounded-full bg-white transition-all duration-300 ${
                  index === active ? 'w-5 opacity-100' : 'w-1.5 opacity-55'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
