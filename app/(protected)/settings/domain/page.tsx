'use client';

import Link from '@/components/ui/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { DomainDnsGuide } from '@/components/settings/domain-dns-guide';
import { useSettingsData } from '../_hooks/use-settings-data';
import { useTranslation } from '@/lib/i18n/hooks';
import { CUSTOM_DOMAIN_CNAME_TARGET } from '@/lib/custom-domain-dns';
import { CopyBtn } from '@/components/affiliates/copy-btn';

export default function DomainDnsSettingsPage() {
  const { t } = useTranslation();
  const { academy } = useSettingsData();
  const publicDomain =
    academy?.domain?.public_address ??
    academy?.Domain?.public_address ??
    null;
  const exampleDomain = publicDomain?.trim() || 'maral.ir';

  return (
    <div className="space-y-6 p-6">
      <SettingsSectionHeader
        title={t('settings.domainDns.title')}
        subtitle={t('settings.domainDns.description')}
        scope="academy"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                {t('settings.domainDns.targetTitle')}
              </CardTitle>
              <CardDescription>
                {t('settings.domainDns.targetDescription')}
              </CardDescription>
            </div>
            <div
              className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 font-mono text-sm"
              dir="ltr"
            >
              <span>{CUSTOM_DOMAIN_CNAME_TARGET}</span>
              <CopyBtn text={CUSTOM_DOMAIN_CNAME_TARGET} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {publicDomain ? (
            <p className="text-sm text-muted-foreground">
              {t('settings.domainDns.currentDomain', { domain: publicDomain })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('settings.domainDns.noDomainYet')}
            </p>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/academy">
              {t('settings.domainDns.openAcademySettings')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('settings.domainDns.stepsTitle')}
          </CardTitle>
          <CardDescription>
            {t('settings.domainDns.stepsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainDnsGuide exampleDomain={exampleDomain} />
        </CardContent>
      </Card>
    </div>
  );
}
