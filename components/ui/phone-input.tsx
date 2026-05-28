'use client';

import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toEnglishDigits } from '@/lib/phone-utils';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';

interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  id = 'phone',
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className
}: PhoneInputProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Phone
          className={cn(
            'absolute top-2.5 h-4 w-4 text-muted-foreground',
            isRTL ? 'right-3' : 'left-3'
          )}
        />
        <Input
          id={id}
          type="tel"
          autoComplete="tel"
          placeholder={t('auth.phonePlaceholder')}
          value={value}
          onChange={(e) => onChange(toEnglishDigits(e.target.value))}
          onBlur={onBlur}
          className={cn(isRTL ? 'pr-9' : 'pl-9', error && 'border-destructive')}
          disabled={disabled}
          dir="ltr"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
