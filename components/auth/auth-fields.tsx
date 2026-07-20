'use client';

import * as React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
}

/** Boxed 56px input matching the auth design (label is the placeholder). */
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, type, ...props }, ref) {
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
            placeholder={label}
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
      className={cn(
        'inline-flex h-12 w-full items-center justify-center rounded-2xl text-base text-[#181C20] transition-colors hover:bg-white/40',
        className
      )}
    >
      {children}
    </button>
  );
}
