'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { EnamadState } from '@/types/compliance';

export function EnamadProofPanel({ state }: { state: EnamadState }) {
  const { t } = useTranslation();
  if (!state.proofs_live || !state.custom_domain) return null;

  return (
    <div className="space-y-3">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('compliance.enamad.proofsReady', { domain: state.custom_domain })}
        </AlertDescription>
      </Alert>
      <ul className="space-y-2 text-sm">
        {state.file_url ? (
          <li>
            <span className="font-medium">{t('compliance.enamad.fileStep')}</span>
            {': '}
            <a
              href={state.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline"
            >
              {state.file_url}
            </a>
          </li>
        ) : null}
        <li>
          <span className="font-medium">{t('compliance.enamad.metaStep')}</span>
          {': '}
          <code className="break-all text-xs">
            {`<meta name="enamad" content="${state.code ?? ''}" />`}
          </code>
        </li>
        {state.info_email ? (
          <li>
            <span className="font-medium">{t('compliance.enamad.emailStep')}</span>
            {': '}
            {t('compliance.enamad.emailStepBody', { email: state.info_email })}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
