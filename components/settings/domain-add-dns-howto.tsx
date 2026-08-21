'use client';

import type { InterpolationParams } from '@/lib/i18n';

type Translate = (key: string, params?: InterpolationParams) => string;

/**
 * Simple “how to Add DNS” — Arvan fields: نوع، عنوان، مقدار، ابر.
 */
export function DomainAddDnsHowTo({
  t,
  domain
}: {
  t: Translate;
  domain: string;
}) {
  const params = { domain };
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-sm font-medium">
        {t('settings.domainDns.howTo.title')}
      </p>
      <ol className="list-decimal space-y-1.5 ps-5 text-sm text-muted-foreground">
        <li>{t('settings.domainDns.howTo.openProvider')}</li>
        <li>{t('settings.domainDns.howTo.openDomain', params)}</li>
        <li>{t('settings.domainDns.howTo.clickAdd')}</li>
        <li>{t('settings.domainDns.howTo.fillType')}</li>
        <li>{t('settings.domainDns.howTo.fillTitle')}</li>
        <li>{t('settings.domainDns.howTo.fillValue')}</li>
        <li>{t('settings.domainDns.howTo.setCloud')}</li>
        <li>{t('settings.domainDns.howTo.save')}</li>
      </ol>
    </div>
  );
}
