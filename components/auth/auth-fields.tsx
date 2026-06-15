'use client';

import * as React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface AuthFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
}

/** Underline-style input matching the auth design. */
export function AuthField({ label, error, type, ...props }: AuthFieldProps) {
  const [show, setShow] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && show ? 'text' : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...props}
          type={inputType}
          placeholder={label}
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
            className="absolute bottom-2 left-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={show ? 'hide password' : 'show password'}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface AuthSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

/** Full-width brand gradient submit button. */
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
        'btn-brand inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/** "or" divider. */
export function AuthDivider() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">
        {t('auth.orContinueWith')}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Continue-with-Google button. */
export function AuthGoogleButton({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-accent"
    >
      <GoogleIcon className="h-4 w-4" />
      {t('auth.continueWithGoogle')}
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.5 14.97.5 12 .5A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.3 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}
