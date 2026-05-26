'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="کپی"
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
