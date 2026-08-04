'use client';

import { useEffect, useRef } from 'react';

const SCRIPT_SRC = 'https://js.hcaptcha.com/1/api.js';

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

function loadHCaptchaScript(): Promise<void> {
  if (window.hcaptcha) return Promise.resolve();
  const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) =>
      existing.addEventListener('load', () => resolve())
    );
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Loaded lazily via script tag (not the @hcaptcha/react-hcaptcha package) to
 * avoid a new dependency for a widget shown only after repeated login
 * failures. Renders nothing if NEXT_PUBLIC_HCAPTCHA_SITE_KEY is unset.
 */
export function HCaptchaWidget({
  onVerify
}: {
  onVerify: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let widgetId: string | undefined;
    let cancelled = false;

    loadHCaptchaScript().then(() => {
      if (cancelled || !containerRef.current || !window.hcaptcha) return;
      widgetId = window.hcaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': () => onVerify('')
      });
    });

    return () => {
      cancelled = true;
      if (widgetId && window.hcaptcha) window.hcaptcha.reset(widgetId);
    };
  }, [siteKey, onVerify]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="flex justify-center py-2" />;
}
