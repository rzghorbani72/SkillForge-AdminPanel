'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export function CopyBtn({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  const title = label ?? t('affiliates.copy');

  async function copy() {
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => {
        void copy();
      }}
      title={title}
      aria-label={title}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {done ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
