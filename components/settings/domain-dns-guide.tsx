'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CUSTOM_DOMAIN_CNAME_TARGET,
  trafficDnsRows
} from '@/lib/custom-domain-dns';
import { DomainAddDnsHowTo } from '@/components/settings/domain-add-dns-howto';
import { DnsRecordTable } from '@/components/settings/dns-record-table';

/**
 * Step-by-step DNS guide so a manager can point their public domain at Mentoma.
 */
export function DomainDnsGuide({
  exampleDomain = 'maral.ir'
}: {
  exampleDomain?: string;
}) {
  const { t } = useTranslation();
  const target = CUSTOM_DOMAIN_CNAME_TARGET;
  const steps = [
    'saveDomain',
    'openDns',
    'addRecord',
    'noNsChange',
    'ssl',
    'wait'
  ] as const;

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('settings.domainDns.intro', { example: exampleDomain })}
        </AlertDescription>
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
                {t(`settings.domainDns.step.${step}.title`)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(`settings.domainDns.step.${step}.body`, {
                  target,
                  example: exampleDomain
                })}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <DomainAddDnsHowTo t={t} domain={exampleDomain} />
      <DnsRecordTable
        title={t('settings.domainDns.mentomaKeysTitle')}
        t={t}
        rows={trafficDnsRows(target)}
        footnote={t('settings.domainDns.hostHint')}
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>{t('settings.domainDns.sslNote')}</AlertDescription>
      </Alert>
    </div>
  );
}
