'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { tNow } from '@/lib/i18n/t-now';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold">
            {tNow('common.somethingWentWrong')}
          </h1>
          <p className="text-muted-foreground">
            {tNow('common.errorLoadingPage')}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            {tNow('common.tryAgain')}
          </button>
        </div>
      </body>
    </html>
  );
}
