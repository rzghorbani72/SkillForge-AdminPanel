'use client';

import { Check, CircleDashed, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACADEMY_DOMAIN, type SlugStatus } from '@/lib/slug';

type SlugFieldProps = {
  value: string;
  status: SlugStatus;
  onChange: (value: string) => void;
  t: (k: string) => string;
};

const MESSAGE_BY_STATUS: Partial<Record<SlugStatus, string>> = {
  invalid: 'stores.slugInvalid',
  taken: 'stores.slugTaken',
  available: 'stores.slugAvailable',
};

export function SlugField({ value, status, onChange, t }: SlugFieldProps) {
  const messageKey = MESSAGE_BY_STATUS[status];

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{t('stores.subdomain')}</label>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring',
          (status === 'taken' || status === 'invalid') && 'border-destructive',
          status === 'available' && 'border-green-500',
        )}
      >
        <span className="flex shrink-0 items-center gap-1 border-r bg-muted px-3 py-2 text-xs text-muted-foreground">
          {ACADEMY_DOMAIN}
          {status === 'checking' && <CircleDashed className="h-3 w-3 animate-spin" />}
          {status === 'available' && <Check className="h-3 w-3 text-green-500" />}
          {status === 'taken' && <X className="h-3 w-3 text-destructive" />}.
        </span>
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="my-academy"
          dir="ltr"
          aria-label={t('stores.subdomain')}
        />
      </div>
      {messageKey && (
        <p
          className={cn(
            'mt-1 text-xs',
            status === 'available' ? 'text-green-600' : 'text-destructive',
          )}
        >
          {t(messageKey)}
        </p>
      )}
    </div>
  );
}
