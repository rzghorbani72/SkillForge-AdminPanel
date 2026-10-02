import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';

export function useUnauthorizedNotice() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [unauthorizedError, setUnauthorizedError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error === 'unauthorized_role') {
      setUnauthorizedError(message || t('auth.loginTitle'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, t]);

  return unauthorizedError;
}
