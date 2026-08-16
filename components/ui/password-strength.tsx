'use client';

import { Check, Circle, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getPasswordChecks, type PasswordChecks } from '@/lib/password-utils';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const checks = getPasswordChecks(password);
  const untouched = password === '';
  const items: { key: keyof PasswordChecks; label: string }[] = [
    { key: 'minLength', label: t('auth.passwordMinLength') },
    { key: 'hasLetter', label: t('auth.passwordHasLetter') },
    { key: 'hasNumber', label: t('auth.passwordHasNumber') },
    { key: 'hasSymbol', label: t('auth.passwordHasSymbol') }
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1 text-[11px]">
          <span className="grid h-3 w-3 shrink-0 place-items-center">
            {untouched ? (
              <Circle className="h-2 w-2 text-muted-foreground/60" />
            ) : checks[key] ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-destructive" />
            )}
          </span>
          <span
            className={
              !untouched && checks[key]
                ? 'text-emerald-600'
                : 'text-muted-foreground'
            }
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
