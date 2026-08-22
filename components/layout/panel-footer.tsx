'use client';

import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Platform-level eNamad seal. The image and link must stay on
 * trustseal.enamad.ir — a local copy fails their domain check, and the seal
 * must not be altered. Academy-owned seals are shown on the academy site, not here.
 */
const SEAL_ID = '7370484';
const SEAL_CODE = 'JQB9S5hD9i2hI9kLvZiyE3UH0Znbj14F';

export function PanelFooter() {
  const { t } = useTranslation();

  const href = `https://trustseal.enamad.ir/?id=${SEAL_ID}&Code=${SEAL_CODE}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${SEAL_ID}&Code=${SEAL_CODE}`;

  return (
    <footer className="mt-8 border-t border-border px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          {t('panelFooter.rights')}
        </span>
        <a
          referrerPolicy="origin"
          target="_blank"
          rel="noopener noreferrer"
          href={href}
        >
          {/* eNamad requires a plain img with referrerPolicy=origin, not next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            referrerPolicy="origin"
            src={src}
            alt={t('panelFooter.enamadAlt')}
            width={125}
            height={136}
            style={{ cursor: 'pointer' }}
          />
        </a>
      </div>
    </footer>
  );
}
