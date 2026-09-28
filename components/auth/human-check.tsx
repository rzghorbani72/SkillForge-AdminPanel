'use client';

import { useEffect, useRef } from 'react';
import type {} from 'altcha/types/react';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useLanguage } from '@/lib/i18n/hooks';

const WIDGET_CONFIGURATION = JSON.stringify({ hideLogo: true, hideFooter: true });

type StateDetail = { state: string; payload?: string };

function isStateDetail(detail: unknown): detail is StateDetail {
  return typeof detail === 'object' && detail !== null && 'state' in detail;
}

interface HumanCheckProps {
  /** Solved ALTCHA payload, or '' when unsolved/expired. Each payload works once. */
  onVerify: (payload: string) => void;
}

/**
 * Self-hosted ALTCHA proof-of-work check shown on every anonymous login and
 * code-send form. Starts solving when the form gets focus, so it is usually
 * done before the user presses submit. Remount (change `key`) after a submit.
 */
export function HumanCheck({ onVerify }: HumanCheckProps) {
  const ref = useRef<HTMLElement>(null);
  const { language } = useLanguage();

  useEffect(() => {
    void import('altcha');
    void import('altcha/i18n/fa');
  }, []);

  useEffect(() => {
    const widget = ref.current;
    if (!widget) return;
    const handleStateChange = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      if (!isStateDetail(detail)) return;
      onVerify(detail.state === 'verified' ? (detail.payload ?? '') : '');
    };
    widget.addEventListener('statechange', handleStateChange);
    return () => widget.removeEventListener('statechange', handleStateChange);
  }, [onVerify]);

  return (
    <div className="flex justify-center py-1">
      <altcha-widget
        ref={ref}
        challenge={`${getBrowserApiBaseUrl()}/captcha/challenge`}
        auto="onfocus"
        language={language}
        configuration={WIDGET_CONFIGURATION}
        suppressHydrationWarning
      />
    </div>
  );
}
