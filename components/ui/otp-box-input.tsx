'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/hooks';
import { toEnglishDigits, toPersianDigits } from '@/lib/phone-utils';

interface OtpBoxInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  /** Fired once the last box is filled, so the code submits without a click. */
  onComplete?: (code: string) => void;
}

export function OtpBoxInput({
  length = 5,
  value,
  onChange,
  disabled,
  autoFocus = true,
  className,
  onComplete,
}: OtpBoxInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { language } = useLanguage();
  const firedRef = useRef<string | null>(null);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (value.length < length || disabled) {
      if (value.length < length) firedRef.current = null;
      return;
    }
    if (firedRef.current === value) return;
    firedRef.current = value;
    onComplete?.(value);
  }, [value, length, disabled, onComplete]);

  const displayDigit = (digit: string) =>
    digit && language === 'fa' ? toPersianDigits(digit) : digit;

  function handleChange(index: number, raw: string) {
    const digit = toEnglishDigits(raw).replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = toEnglishDigits(e.clipboardData.getData('text'))
      .replace(/\D/g, '')
      .slice(0, length);
    const next = Array.from({ length }, (_, i) => text[i] ?? '');
    onChange(next.join(''));
    const focusIdx = Math.min(text.length, length - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  return (
    <div className={cn('flex justify-center gap-2', className)} dir="ltr">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={displayDigit(digit)}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'h-14 w-14 rounded-lg border border-[#c7c7c7] bg-transparent text-center font-mono text-xl font-semibold',
            'outline-none transition-colors',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      ))}
    </div>
  );
}
