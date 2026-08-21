'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { DomainAddDnsHowTo } from '@/components/settings/domain-add-dns-howto';
import { DnsRecordTable } from '@/components/settings/dns-record-table';
import {
  DomainSetupCheckButton,
  DomainSetupStepCard
} from '@/components/settings/domain-setup-step-card';
import { DomainPlatformSteps } from '@/components/settings/domain-platform-steps';
import {
  toDnsPanelHost,
  toManagerAcmeRows,
  trafficDnsRows,
  stripDnsDot
} from '@/lib/custom-domain-dns';
import type {
  AcmeDnsRecord,
  CustomDomainSetupResponse
} from '@/types/custom-domain-setup';

export function DomainConnectionWizard() {
  const { t } = useTranslation();
  const [data, setData] = useState<CustomDomainSetupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hamraveshHost, setHamraveshHost] = useState('');
  const [acmeRows, setAcmeRows] = useState<AcmeDnsRecord[]>([
    { host: '', value: '' }
  ]);

  const apply = useCallback((next: CustomDomainSetupResponse) => {
    setData(next);
    setHamraveshHost(
      next.setup.hamravesh_hostname ?? next.public_address ?? ''
    );
    const zone = next.public_address ?? '';
    setAcmeRows(
      next.setup.acme_records.length > 0
        ? next.setup.acme_records.map((r) => ({
            host: toDnsPanelHost(r.host, zone),
            value: stripDnsDot(r.value)
          }))
        : [{ host: '', value: '' }]
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      apply(await apiClient.getCustomDomainSetup());
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (
    body: Parameters<typeof apiClient.updateCustomDomainSetup>[0]
  ) => {
    setSaving(true);
    try {
      apply(await apiClient.updateCustomDomainSetup(body));
      ErrorHandler.showSuccess(t('settings.domainDns.stepSaved'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const verifyDns = async () => {
    setSaving(true);
    try {
      const result = await apiClient.verifyCustomDomainDns();
      if (data) {
        apply({ ...data, setup: result.setup, steps: result.steps });
      }
      if (result.ok) {
        ErrorHandler.showSuccess(t('settings.domainDns.dnsOk'));
      } else {
        ErrorHandler.showError(
          t('settings.domainDns.dnsFail', {
            resolved: result.resolved_to ?? '—'
          })
        );
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('settings.domainDns.loading')}
      </p>
    );
  }

  const target = data.cname_target;
  const domain = data.public_address ?? 'maral.ir';
  const { steps, setup } = data;
  const actorPlatform = t('settings.domainDns.actorPlatform');
  const actorManager = t('settings.domainDns.actorManager');

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('settings.domainDns.wizardIntro')}
        </AlertDescription>
      </Alert>

      <ol className="space-y-3">
        <DomainSetupStepCard
          index={1}
          actor="manager"
          actorLabel={actorManager}
          done={steps.save_domain.done}
          title={t('settings.domainDns.wizard.save.title')}
          body={t('settings.domainDns.wizard.save.body')}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/academy">
                {t('settings.domainDns.openAcademySettings')}
              </Link>
            </Button>
            <DomainSetupCheckButton
              label={t('settings.domainDns.recheck')}
              loading={saving}
              onClick={() => void load()}
              done={steps.save_domain.done}
            />
            {data.public_address ? (
              <span className="font-mono text-xs" dir="ltr">
                {data.public_address}
              </span>
            ) : null}
          </div>
        </DomainSetupStepCard>

        <DomainPlatformSteps
          domain={domain}
          hamraveshDone={steps.hamravesh_attach.done}
          pasteDone={steps.paste_acme.done}
          saveDone={steps.save_domain.done}
          hamraveshHost={hamraveshHost}
          setHamraveshHost={setHamraveshHost}
          acmeRows={acmeRows}
          setAcmeRows={setAcmeRows}
          saving={saving}
          actorPlatform={actorPlatform}
          t={t}
          onAttach={() =>
            void patch({
              hamravesh_hostname: hamraveshHost.trim(),
              hamravesh_attached: true
            })
          }
          onSaveAcme={() =>
            void patch({
              acme_records: acmeRows
                .filter((r) => r.host && r.value)
                .map((r) => ({
                  host: toDnsPanelHost(r.host, domain),
                  value: stripDnsDot(r.value)
                }))
            })
          }
        />

        <DomainSetupStepCard
          index={4}
          actor="manager"
          actorLabel={actorManager}
          done={steps.traffic_dns.done}
          title={t('settings.domainDns.wizard.traffic.title')}
          body={t('settings.domainDns.wizard.traffic.body', { target })}
        >
          <DomainAddDnsHowTo t={t} domain={domain} />
          <DnsRecordTable
            t={t}
            rows={trafficDnsRows(target)}
            footnote={t('settings.domainDns.hostHint')}
          />
          <DomainSetupCheckButton
            label={t('settings.domainDns.wizard.traffic.check')}
            loading={saving}
            disabled={!steps.save_domain.done}
            onClick={() => void verifyDns()}
            done={steps.traffic_dns.done}
          />
          {setup.dns_resolved_to ? (
            <p className="text-xs text-muted-foreground" dir="ltr">
              {t('settings.domainDns.resolvedTo', {
                value: setup.dns_resolved_to
              })}
            </p>
          ) : null}
        </DomainSetupStepCard>

        <DomainSetupStepCard
          index={5}
          actor="manager"
          actorLabel={actorManager}
          done={steps.acme_dns.done}
          title={t('settings.domainDns.wizard.acmeDns.title')}
          body={t('settings.domainDns.wizard.acmeDns.body')}
        >
          {setup.acme_records.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {t('settings.domainDns.wizard.acmeDns.waitPlatform')}
            </p>
          ) : (
            <>
              <DomainAddDnsHowTo t={t} domain={domain} />
              <DnsRecordTable
                t={t}
                rows={toManagerAcmeRows(setup.acme_records, domain)}
                footnote={`${t('settings.domainDns.hostHint')} ${t('settings.domainDns.wizard.acmeDns.proxyOff')}`}
              />
            </>
          )}
          <DomainSetupCheckButton
            label={t('settings.domainDns.wizard.acmeDns.check')}
            loading={saving}
            disabled={!steps.paste_acme.done}
            onClick={() => void patch({ acme_confirmed: true })}
            done={steps.acme_dns.done}
          />
        </DomainSetupStepCard>

        <DomainSetupStepCard
          index={6}
          actor="platform"
          actorLabel={actorPlatform}
          done={steps.ssl_ready.done}
          title={t('settings.domainDns.wizard.ssl.title')}
          body={t('settings.domainDns.wizard.ssl.body')}
        >
          <DomainSetupCheckButton
            label={t('settings.domainDns.wizard.ssl.check')}
            loading={saving}
            disabled={!steps.hamravesh_attach.done}
            onClick={() => void patch({ ssl_confirmed: true })}
            done={steps.ssl_ready.done}
          />
        </DomainSetupStepCard>
      </ol>
    </div>
  );
}
