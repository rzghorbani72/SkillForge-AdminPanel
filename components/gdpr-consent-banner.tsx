'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/app-logger';

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
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background px-4 py-3 shadow-lg sm:px-6"
    >
      <p className="text-sm text-muted-foreground">
        We use cookies to deliver this service and to improve your experience.{' '}
        <a href="/privacy" className="underline hover:text-foreground">
          Learn more
        </a>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={decline}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
