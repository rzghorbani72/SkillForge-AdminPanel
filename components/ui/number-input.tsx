'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { toEnglishDigits, toPersianDigits } from '@/lib/phone-utils';
import { useLanguage } from '@/lib/i18n/hooks';
import { Input } from './input';

/** Group the integer part of a raw digit string into thousands, keeping any decimal part untouched. */
function groupDigits(raw: string, isFa: boolean): string {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const separator = isFa ? '٬' : ',';
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const display = decPart !== undefined ? `${grouped}.${decPart}` : grouped;
  return isFa ? toPersianDigits(display) : display;
}

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Raw digit string (no separators) — what gets stored */
  value: string | number | null | undefined;
  /** Receives the raw digit string; caller decides how to parse it (Number(raw), or keep empty) */
  onChange: (raw: string) => void;
  /** Allow one decimal point, e.g. for weight/kg fields */
  allowDecimal?: boolean;
  /** Unit shown inline at the end of the field, e.g. "تومان" or "عدد" */
  suffix?: string;
}

/**
 * Numeric text input that converts Persian/Arabic digits to English as you type
 * and shows thousands separators, while storing a plain digit string so
 * validation/submit logic stays simple.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, allowDecimal, suffix, className, ...props }, ref) => {
    const { language } = useLanguage();
    const isFa = language === 'fa';
    const stripPattern = allowDecimal ? /[^\d.]/g : /\D/g;
    const raw = toEnglishDigits(String(value ?? '')).replace(stripPattern, '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let cleaned = toEnglishDigits(e.target.value).replace(stripPattern, '');
      if (allowDecimal) {
        const firstDot = cleaned.indexOf('.');
        if (firstDot !== -1) {
          cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
        }
      }
      onChange(cleaned);
    };

    const input = (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={groupDigits(raw, isFa)}
        onChange={handleChange}
        className={suffix ? cn('pe-14', className) : className}
        {...props}
      />
    );

    if (!suffix) return input;

    return (
      <div className="relative">
        {input}
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
    );
  },
);
NumberInput.displayName = 'NumberInput';
