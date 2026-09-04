'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

const STARS = [1, 2, 3, 4, 5] as const;

interface TemplateStarRatingProps {
  /** Average across every academy, 0 when nobody has voted. */
  rating: number;
  ratingCount: number;
  /** This academy's own vote, null when it has not rated the template. */
  myRating: number | null;
  onRate: (stars: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

/**
 * One vote per academy. Hovering previews the stars that a click would set,
 * and clicking the star already selected withdraws the vote — the same gesture
 * users expect from a toggle, so no separate "remove" control is needed.
 *
 * Positioning is logical (`start`/`end`), so the row reads correctly in RTL.
 */
export function TemplateStarRating({
  rating,
  ratingCount,
  myRating,
  onRate,
  onClear,
  disabled = false
}: TemplateStarRatingProps) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(0);
  const shown = hover || myRating || 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(0)}
        role="group"
        aria-label={t('sitePreview.ratingTitle')}
      >
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            title={t('sitePreview.ratingStars', { count: star })}
            aria-label={t('sitePreview.ratingStars', { count: star })}
            aria-pressed={myRating === star}
            onMouseEnter={() => setHover(star)}
            onClick={(e) => {
              e.stopPropagation();
              if (myRating === star) onClear();
              else onRate(star);
            }}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className={`h-4 w-4 ${
                star <= shown
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
      </div>

      <span className="text-[11px] font-semibold text-muted-foreground">
        {ratingCount > 0
          ? t('sitePreview.ratingSummary', {
              average: rating.toFixed(1),
              count: ratingCount
            })
          : t('sitePreview.ratingEmpty')}
      </span>
    </div>
  );
}
