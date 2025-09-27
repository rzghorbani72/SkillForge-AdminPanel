'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('pl-10', error && 'border-red-500', className)}
          disabled={disabled}
          maxLength={maxLength}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
