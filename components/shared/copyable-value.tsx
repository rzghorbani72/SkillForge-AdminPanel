'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type Props = {
  /** What lands on the clipboard. */
  value: string;
  /** What is shown; defaults to the value itself. */
  display?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
};

/** Inline text with a copy button — for IBANs, tracking codes and amounts. */
export function CopyableValue({ value, display, dir = 'ltr', className }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; keep quiet.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={t('common.copy')}
      aria-label={t('common.copy')}
      dir={dir}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md px-1 text-start',
        'transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="break-all">{display ?? value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      )}
    </button>
  );
}
