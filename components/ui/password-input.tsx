'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { sanitizePasswordInput } from '@/lib/password-utils';

interface PasswordInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Password field with a reveal toggle. Input is sanitised to printable ASCII,
 * so a Persian keyboard can never store an unusable password.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput({ value, onChange, className, ...props }, ref) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        dir="ltr"
        value={value}
        onChange={(event) =>
          onChange(sanitizePasswordInput(event.target.value))
        }
        className={cn(isRTL ? 'pl-9' : 'pr-9', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={t(isVisible ? 'auth.hidePassword' : 'auth.showPassword')}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
          isRTL ? 'left-3' : 'right-3'
        )}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});
