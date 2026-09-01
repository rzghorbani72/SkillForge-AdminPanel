'use client';

import * as React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from '@/components/ui/link';
import { cn } from '@/lib/utils';
import { toEnglishDigits, toPersianDigits } from '@/lib/phone-utils';
import { useLanguage } from '@/lib/i18n/hooks';

const AUTH_SECONDARY_CLASS =
  'inline-flex h-12 w-full items-center justify-center rounded-2xl text-base text-[#181C20] transition-colors hover:bg-white/40';

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
}

/** Boxed 56px input matching the auth design (label is the placeholder). */
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, type, placeholder, ...props }, ref) {
    const [show, setShow] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && show ? 'text' : type;

    return (
      <div className="space-y-1">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={inputType}
            placeholder={placeholder ?? label}
            aria-label={label}
            className={cn(
              'auth-input',
              isPassword && 'with-toggle',
              error && 'has-error'
            )}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 left-3 flex items-center text-[#181C20] transition-opacity hover:opacity-70"
              aria-label={label}
            >
              {show ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="px-3 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

interface AuthPhoneFieldProps
  extends Omit<AuthFieldProps, 'value' | 'onChange' | 'type'> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Phone input for every auth screen: Persian digits on screen in fa, English
 * digits in state — so what is sent to the API is always English.
 */
const PHONE_PLACEHOLDER = '0912 *** ** **';

export function AuthPhoneField({
  value,
  onValueChange,
  ...props
}: AuthPhoneFieldProps) {
  const { language } = useLanguage();

  return (
    <AuthField
      {...props}
      type="tel"
      inputMode="tel"
      dir="ltr"
      autoComplete="tel"
      placeholder={PHONE_PLACEHOLDER}
      value={language === 'fa' ? toPersianDigits(value) : value}
      onChange={(e) => onValueChange(toEnglishDigits(e.target.value))}
    />
  );
}

interface AuthSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

/** Full-width solid brand submit button. */
export function AuthSubmit({
  loading,
  children,
  className,
  disabled,
  ...props
}: AuthSubmitProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'btn-brand inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-medium',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/** Full-width quiet button used for the secondary auth action. */
export function AuthSecondaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(AUTH_SECONDARY_CLASS, className)}
    >
      {children}
    </button>
  );
}

/** Same look as AuthSecondaryButton, but a real link — never submits a form. */
export function AuthSecondaryLink({
  className,
  children,
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(AUTH_SECONDARY_CLASS, className)}
      {...props}
    >
      {children}
    </Link>
  );
}
