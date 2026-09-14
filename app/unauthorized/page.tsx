'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthLogo } from '@/components/auth/auth-logo';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { signOut } from '@/lib/sign-out';

const REDIRECT_SECONDS = 30;

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const leaving = useRef(false);

  /**
   * A banned or deactivated staff session may still hold cookies. Going to
   * /login without signing out would bounce them back into the panel.
   */
  const goToLogin = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    void signOut('/login');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) goToLogin();
  }, [secondsLeft, goToLogin]);

  const bullets = [t('unauthorized.contactStoreAdmin'), t('unauthorized.contactSupport')];

  return (
    <AuthLayout>
      <div className="auth-card fade-in-up flex flex-col gap-6 rounded-3xl p-6 sm:p-10">
        <AuthLogo className="self-center" />

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </span>
          <h1 className="text-lg font-bold text-[#181C20]">{t('unauthorized.title')}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{t('unauthorized.description')}</p>
        </div>

        <ul className="space-y-2 rounded-2xl bg-white/50 p-4 text-sm text-foreground">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-6">{item}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <p className="text-center text-xs text-muted-foreground">
            {t('unauthorized.redirectingIn', {
              seconds: formatNumber(secondsLeft),
            })}
          </p>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-black/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={REDIRECT_SECONDS}
            aria-valuenow={secondsLeft}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / REDIRECT_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={goToLogin}>
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
