'use client';

import * as React from 'react';
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
}

/**
 * Money input that shows thousands separators while typing but stores a plain
 * digit string, so validation/submit logic stays simple.
 */
export const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const raw = String(value ?? '').replace(/\D/g, '');

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={groupDigits(raw)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        {...props}
      />
    );
  }
);
PriceInput.displayName = 'PriceInput';
