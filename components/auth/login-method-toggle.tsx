'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

export type LoginMethod = 'password' | 'otp';

const METHODS: readonly LoginMethod[] = ['password', 'otp'];

interface LoginMethodToggleProps {
  value: LoginMethod;
  onChange: (method: LoginMethod) => void;
  disabled?: boolean;
}

export function LoginMethodToggle({ value, onChange, disabled }: LoginMethodToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4">
      {METHODS.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          disabled={disabled}
          aria-pressed={value === method}
          className={cn(
            'h-12 flex-1 rounded-2xl text-base transition-colors',
            value === method
              ? 'bg-white/50 font-medium text-[#181C20]'
              : 'text-[#727272] hover:bg-white/30',
          )}
        >
          {method === 'password' ? t('auth.loginWithPassword') : t('auth.loginWithOtp')}
        </button>
      ))}
    </div>
  );
}
