'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import {
  DomainSetupBlank,
  DomainSetupCheckButton,
  DomainSetupStepCard,
} from '@/components/settings/domain-setup-step-card';
import type { AcmeDnsRecord } from '@/types/custom-domain-setup';

type Props = {
  domain: string;
  hamraveshDone: boolean;
  pasteDone: boolean;
  saveDone: boolean;
  hamraveshHost: string;
  setHamraveshHost: (v: string) => void;
  acmeRows: AcmeDnsRecord[];
  setAcmeRows: (rows: AcmeDnsRecord[]) => void;
  saving: boolean;
  onAttach: () => void;
  onSaveAcme: () => void;
  actorPlatform: string;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export function DomainPlatformSteps({
  domain,
  hamraveshDone,
  pasteDone,
  saveDone,
  hamraveshHost,
  setHamraveshHost,
  acmeRows,
  setAcmeRows,
  saving,
  onAttach,
  onSaveAcme,
  actorPlatform,
  t,
}: Props) {
  return (
    <>
      <DomainSetupStepCard
        index={2}
        actor="platform"
        actorLabel={actorPlatform}
        done={hamraveshDone}
        title={t('settings.domainDns.wizard.hamravesh.title')}
        body={t('settings.domainDns.wizard.hamravesh.body', { domain })}
      >
        <DomainSetupBlank
          id="hamravesh-host"
          label={t('settings.domainDns.wizard.hamravesh.blank')}
          value={hamraveshHost}
          onChange={setHamraveshHost}
          placeholder={domain}
        />
        <DomainSetupCheckButton
          label={t('settings.domainDns.wizard.hamravesh.check')}
          loading={saving}
          disabled={!hamraveshHost.trim() || !saveDone}
          onClick={onAttach}
          done={hamraveshDone}
        />
      </DomainSetupStepCard>

      <DomainSetupStepCard
        index={3}
        actor="platform"
        actorLabel={actorPlatform}
        done={pasteDone}
        title={t('settings.domainDns.wizard.acmePaste.title')}
        body={t('settings.domainDns.wizard.acmePaste.body')}
      >
        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground sm:grid">
            <span>{t('settings.domainDns.colName')}</span>
            <span>{t('settings.domainDns.colValue')}</span>
            <span />
          </div>
          {acmeRows.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                placeholder="_acme-challenge"
                aria-label={t('settings.domainDns.colName')}
                value={row.host}
                onChange={(e) => {
                  const next = [...acmeRows];
                  next[i] = { ...next[i], host: e.target.value };
                  setAcmeRows(next);
                }}
              />
              <Input
                dir="ltr"
                className="font-mono text-xs"
                placeholder="xxx.acme-dns.onhamravesh.ir"
                aria-label={t('settings.domainDns.colValue')}
                value={row.value}
                onChange={(e) => {
                  const next = [...acmeRows];
                  next[i] = { ...next[i], value: e.target.value };
                  setAcmeRows(next);
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={acmeRows.length <= 1}
                onClick={() => setAcmeRows(acmeRows.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAcmeRows([...acmeRows, { host: '', value: '' }])}
            >
              <Plus className="me-1 h-3.5 w-3.5" />
              {t('settings.domainDns.wizard.acmePaste.addRow')}
            </Button>
            <DomainSetupCheckButton
              label={t('settings.domainDns.wizard.acmePaste.check')}
              loading={saving}
              disabled={!hamraveshDone}
              onClick={onSaveAcme}
              done={pasteDone}
            />
          </div>
        </div>
      </DomainSetupStepCard>
    </>
  );
}
