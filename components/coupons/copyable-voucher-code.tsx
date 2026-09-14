'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export function CopyableVoucherCode({ code, className }: { code: string; className?: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const label = t('coupons.bannerCopyCode', { code });

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; keep quiet.
    }
  }

  return (
    <div className={cn('flex w-full justify-start text-right', className)}>
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        title={label}
        aria-label={label}
        dir="ltr"
        className={cn(
          'inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1',
          'font-mono text-xs font-semibold tracking-wide text-foreground',
          'transition-colors hover:border-primary/40 hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span className="truncate">{code}</span>
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>
    </div>
  );
}
