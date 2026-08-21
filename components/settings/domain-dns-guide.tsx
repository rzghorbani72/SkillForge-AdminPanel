'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { CopyBtn } from '@/components/affiliates/copy-btn';
import { useTranslation } from '@/lib/i18n/hooks';
import { CUSTOM_DOMAIN_CNAME_TARGET } from '@/lib/custom-domain-dns';
import type { InterpolationParams } from '@/lib/i18n';

type Translate = (key: string, params?: InterpolationParams) => string;

type DnsRecordRow = {
  type: string;
  name: string;
  value: string;
};

function RecordTable({
  title,
  rows,
  t
}: {
  title: string;
  rows: DnsRecordRow[];
  t: Translate;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colType')}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colName')}
              </th>
              <th className="px-3 py-2 text-start font-medium">
                {t('settings.domainDns.colValue')}
              </th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.type}-${row.name}`} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{row.type}</td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {row.name}
                </td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {row.value}
                </td>
                <td className="px-2 py-2">
                  <CopyBtn text={row.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

      <RecordTable
        title={t('settings.domainDns.recommendedTitle')}
        t={t}
        rows={[
          {
            type: 'CNAME',
            name: 'www',
            value: target
          }
        ]}
      />

      <RecordTable
        title={t('settings.domainDns.apexTitle')}
        t={t}
        rows={[
          {
            type: 'ANAME / A',
            name: '@',
            value: target
          }
        ]}
      />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('settings.domainDns.sslNote')}
        </AlertDescription>
      </Alert>
    </div>
  );
}
