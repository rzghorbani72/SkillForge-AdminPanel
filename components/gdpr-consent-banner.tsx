'use client';

import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { logger } from '@/lib/logging/app-logger';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

const COOKIE_NAME = 'gdpr_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function GdprConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE);
    logger.event('Gdpr', 'ConsentAccepted', { surface: 'panel' });
    setVisible(false);
  }

  function decline() {
    setCookie(COOKIE_NAME, 'declined', COOKIE_MAX_AGE);
    logger.event('Gdpr', 'ConsentDeclined', { surface: 'panel' });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('gdpr.message')}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:px-6"
    >
      <div className="flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <div className="flex shrink-0 items-center justify-center rounded-full bg-primary/10 p-2.5 text-primary">
          <Cookie className="size-5" />
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {t('gdpr.message')}{' '}
          <a
            href="/privacy"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
          >
            {t('gdpr.learnMore')}
          </a>
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={decline}>
            {t('gdpr.decline')}
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none" onClick={accept}>
            {t('gdpr.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
