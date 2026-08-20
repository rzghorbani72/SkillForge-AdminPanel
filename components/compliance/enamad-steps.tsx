'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Checklist for what the manager must prepare in enamad.ir. Mentoma places the
 * file, meta tag, and footer widget once they save the code in this panel.
 */
export function EnamadSteps({ domain }: { domain: string | null }) {
  const { t } = useTranslation();

  const steps = [
    'ownership',
    'businessInfo',
    'contactInfo',
    'commitment',
    'technical'
  ] as const;

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t('compliance.enamad.introHelp')}</AlertDescription>
      </Alert>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <Badge
              variant="outline"
              className="mt-0.5 h-6 w-6 shrink-0 justify-center rounded-full p-0"
            >
              {index + 1}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t(`compliance.enamad.step.${step}.title`)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(`compliance.enamad.step.${step}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {domain ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('compliance.enamad.technicalHelp', { domain })}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
