'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';
import { resolvePageTitleKey } from '@/lib/seo/page-title';

/** Keeps the browser tab title translated and in sync with the current route. */
export function PageTitleSync() {
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    const siteTitle = t('meta.title');
    const key = resolvePageTitleKey(pathname);
    const pageTitle = key ? t(key) : null;
    const title =
      pageTitle && pageTitle !== key
        ? t('meta.titleTemplate').replace('%s', pageTitle)
        : siteTitle;

    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();

    // Next renders its own <title> after hydration; re-apply when it does.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true
    });
    return () => observer.disconnect();
  }, [pathname, t]);

  return null;
}
