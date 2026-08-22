'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';

type SeoPreviewProps = {
  /** What the manager typed, or the fallback the site would use instead. */
  title: string;
  description: string;
  siteUrl: string;
  shareImageUrl: string;
};

/**
 * Managers do not read meta tags; they recognise a Google result and a shared
 * link. Showing both is what makes the fields self-explanatory.
 */
export function SeoPreview({
  title,
  description,
  siteUrl,
  shareImageUrl
}: SeoPreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('website.seo.previewSearch')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1" dir="ltr">
            <p className="truncate text-xs text-emerald-700 dark:text-emerald-500">
              {siteUrl}
            </p>
            <p className="line-clamp-1 text-lg text-blue-700 dark:text-blue-400">
              {title}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('website.seo.previewShare')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="relative aspect-[1200/630] bg-muted">
              {shareImageUrl ? (
                <img
                  src={shareImageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  {t('website.seo.shareImageEmpty')}
                </div>
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-xs uppercase text-muted-foreground">
                {siteUrl}
              </p>
              <p className="line-clamp-1 text-sm font-semibold">{title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
