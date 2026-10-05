'use client';

import { ScaledIframe } from '@/components/shared/scaled-iframe';
import { academySiteUrl } from '@/lib/academy-site-url';
import { resizedMediaUrl, resolveMediaUrl } from '@/lib/media-url';
import type { AcademyRow } from './academy-helpers';

const BANNER_WIDTH = 480;
const BANNER_WIDTH_2X = 828;
const BANNER_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
const LAYER = 'absolute inset-0 -z-10 h-full w-full';

/** Banner image when the template has one, else a live thumbnail of the site. */
export function AcademyCardBanner({ academy }: { academy: AcademyRow }) {
  const bannerUrl = resolveMediaUrl(academy.template_banner);
  if (bannerUrl) {
    return (
      <img
        src={resizedMediaUrl(bannerUrl, BANNER_WIDTH)}
        srcSet={`${resizedMediaUrl(bannerUrl, BANNER_WIDTH)} ${BANNER_WIDTH}w, ${resizedMediaUrl(bannerUrl, BANNER_WIDTH_2X)} ${BANNER_WIDTH_2X}w`}
        sizes={BANNER_SIZES}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${LAYER} object-cover`}
      />
    );
  }

  const siteUrl = academy.site_disabled_at || academy.suspended_at ? null : academySiteUrl(academy);
  if (!siteUrl) return null;
  return (
    <div className={LAYER}>
      <ScaledIframe src={`${siteUrl}/?embed=1`} title={academy.name} className="h-full w-full" />
    </div>
  );
}
