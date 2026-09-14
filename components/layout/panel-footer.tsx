'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';

export function PanelFooter() {
  const { t, language } = useTranslation();
  const landingUrl = resolveStorefrontBaseUrl();
  const year = new Date().toLocaleDateString(language === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
  });

  return (
    <footer className="mt-auto h-[50px] shrink-0 border-t border-border px-4">
      <div className="flex h-full items-center justify-center">
        <p className="truncate text-center text-xs text-muted-foreground">
          © {year} · {t('panelFooter.poweredBy')}{' '}
          <a
            href={landingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            {t('panelFooter.brand')}
          </a>
        </p>
      </div>
    </footer>
  );
}
