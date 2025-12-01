'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/hooks';

interface InputWithIconProps {
  id: string;
  label: string;
  type: 'email' | 'tel' | 'text' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  error?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

export function InputWithIcon({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  disabled = false,
  className,
  maxLength
}: InputWithIconProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
        />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            isRTL ? 'pe-10 pr-10' : 'pl-10 ps-10',
            error && 'border-red-500',
            className
          )}
          disabled={disabled}
          maxLength={maxLength}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
