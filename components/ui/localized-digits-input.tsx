'use client';

import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { toEnglishDigits, toPersianDigits } from '@/lib/phone-utils';
import { useTranslation } from '@/lib/i18n/hooks';

interface LocalizedDigitsInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Shows digits in the UI language (۰۹۱۲…) while the caller always receives
 * ASCII. The mapping is one character to one character, so the caret never
 * jumps while typing.
 */
export const LocalizedDigitsInput = React.forwardRef<HTMLInputElement, LocalizedDigitsInputProps>(
  function LocalizedDigitsInput({ value, onChange, ...props }, ref) {
    const { language } = useTranslation();
    const display = language === 'fa' ? toPersianDigits(value) : value;

    return (
      <Input
        ref={ref}
        dir="ltr"
        inputMode="numeric"
        value={display}
        onChange={(event) => onChange(toEnglishDigits(event.target.value))}
        {...props}
      />
    );
  },
);
