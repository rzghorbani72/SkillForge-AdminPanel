'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { resolveStorefrontBaseUrl } from '@/lib/ui-template/preview-url';

/**
 * Platform-level eNamad seal. The image and link must stay on
 * trustseal.enamad.ir — a local copy fails their domain check, and the seal
 * must not be altered. Academy-owned seals are shown on the academy site, not here.
 */
const SEAL_ID = '7370484';
const SEAL_CODE = 'JQB9S5hD9i2hI9kLvZiyE3UH0Znbj14F';

export function PanelFooter() {
  const { t, language } = useTranslation();
  const landingUrl = resolveStorefrontBaseUrl();
  const year = new Date().toLocaleDateString(
    language === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US',
    { year: 'numeric' }
  );

  const href = `https://trustseal.enamad.ir/?id=${SEAL_ID}&Code=${SEAL_CODE}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${SEAL_ID}&Code=${SEAL_CODE}`;

  return (
    <footer className="mt-auto h-20 shrink-0 border-t border-border px-4">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="truncate text-xs text-muted-foreground">
          <span>
            © {year} · {t('panelFooter.poweredBy')}{' '}
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-4 hover:underline"
            >
              {t('panelFooter.brand')}
            </a>
          </span>
        </div>
        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noopener noreferrer"
          href={href}
          className="shrink-0"
        >
          {/* eNamad requires a plain img with referrerPolicy=origin, not next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src={src}
            alt={t('panelFooter.enamadAlt')}
            width={125}
            height={136}
            className="h-14 w-auto"
            style={{ cursor: 'pointer' }}
          />
        </a>
      </div>
    </footer>
  );
}
