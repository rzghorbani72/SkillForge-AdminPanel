'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { toEnglishDigits } from '@/lib/phone-utils';
import { Input } from './input';

/** Group a raw digit string into thousands: "1234567" → "1,234,567" */
function groupDigits(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface PriceInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
  > {
  /** Raw digit string (no separators) — what gets stored */
  value: string | number | null | undefined;
  /** Receives the raw digit string */
  onChange: (raw: string) => void;
  /** Currency unit shown inline at the end of the field, e.g. "تومان" */
  suffix?: string;
}

/**
 * Money input that shows thousands separators while typing but stores a plain
 * digit string, so validation/submit logic stays simple.
 */
export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, suffix, className, ...props }, ref) => {
    const raw = String(value ?? '').replace(/\D/g, '');

    if (!suffix) {
      return (
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={groupDigits(raw)}
          onChange={(e) =>
            onChange(toEnglishDigits(e.target.value).replace(/\D/g, ''))
          }
          className={className}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={groupDigits(raw)}
          onChange={(e) =>
            onChange(toEnglishDigits(e.target.value).replace(/\D/g, ''))
          }
          className={cn('pe-14', className)}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
    );
  }
);
PriceInput.displayName = 'PriceInput';
