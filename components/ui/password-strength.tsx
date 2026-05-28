'use client';

import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

export interface PasswordChecks {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password)
  };
}

export function isPasswordValid(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasLetter && c.hasNumber;
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const items: { key: keyof PasswordChecks; label: string }[] = [
    { key: 'minLength', label: t('auth.passwordMinLength') },
    { key: 'hasLetter', label: t('auth.passwordHasLetter') },
    { key: 'hasNumber', label: t('auth.passwordHasNumber') }
  ];

  return (
    <div className="space-y-1">
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1.5 text-xs">
          {checks[key] ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <X className="h-3 w-3 text-destructive" />
          )}
          <span
            className={
              checks[key] ? 'text-emerald-600' : 'text-muted-foreground'
            }
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
