'use client';

import { ArrowLeft, Building2 } from 'lucide-react';

type CreateAcademyBannerProps = {
  onCreate: () => void;
  t: (k: string) => string;
};

/**
 * Not dismissible on purpose: a manager with no academy has an empty panel and
 * this is their only way out of it.
 */
export function CreateAcademyBanner({ onCreate, t }: CreateAcademyBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-l from-primary/10 to-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Building2 className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-1.5 text-xl font-bold tracking-tight">{t('onboarding.bannerTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('onboarding.bannerDescription')}</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('onboarding.bannerAction')}
          <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
        </button>
      </div>
    </div>
  );
}
