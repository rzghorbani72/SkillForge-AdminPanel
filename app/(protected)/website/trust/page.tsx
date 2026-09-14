'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { EnamadSteps } from '@/components/compliance/enamad-steps';
import { EnamadHostingForm } from '@/components/compliance/enamad-hosting-form';
import { EnamadProofPanel } from '@/components/compliance/enamad-proof-panel';
import { EnamadStatusBadge } from '@/components/compliance/review-status-badge';
import { ENAMAD_STATUS, type EnamadState } from '@/types/compliance';

export default function AcademyCompliancePage() {
  const { t } = useTranslation();
  const [state, setState] = useState<EnamadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [sealId, setSealId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getEnamadState();
      setState(data);
      setCode(data?.code ?? '');
      setSealId(data?.seal_id ?? '');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setSaving(true);
    try {
      const next = await apiClient.submitEnamadCode(code.trim(), sealId.trim());
      setState(next);
      setCode(next.code ?? '');
      setSealId(next.seal_id ?? '');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleTitle = async (enabled: boolean) => {
    setSaving(true);
    try {
      const next = await apiClient.updateEnamadHosting({
        enamad_title_verify: enabled,
      });
      setState(next);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const saveSealId = async () => {
    if (!sealId.trim()) return;
    setSaving(true);
    try {
      const next = await apiClient.updateEnamadHosting({
        enamad_seal_id: sealId.trim(),
      });
      setState(next);
      setSealId(next.seal_id ?? '');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!state?.is_required) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <SettingsSectionHeader
          title={t('compliance.enamad.title')}
          subtitle={t('compliance.enamad.description')}
        />
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{t('compliance.enamad.subdomainNotice')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <SettingsSectionHeader
        title={t('compliance.enamad.title')}
        subtitle={t('compliance.enamad.description')}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{t('compliance.enamad.statusTitle')}</CardTitle>
              <CardDescription>{state.custom_domain}</CardDescription>
            </div>
            <EnamadStatusBadge status={state.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.status === ENAMAD_STATUS.REJECTED && state.review_note ? (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{state.review_note}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === ENAMAD_STATUS.PENDING ? (
            <Alert>
              <AlertDescription>{t('compliance.enamad.pendingNotice')}</AlertDescription>
            </Alert>
          ) : null}
          {state.status !== ENAMAD_STATUS.VERIFIED ? (
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{t('compliance.enamad.requiredNotice')}</AlertDescription>
            </Alert>
          ) : null}
          <EnamadHostingForm
            state={state}
            code={code}
            sealId={sealId}
            saving={saving}
            onCodeChange={setCode}
            onSealIdChange={setSealId}
            onSubmit={submit}
            onSaveSealId={saveSealId}
            onTitleVerify={toggleTitle}
          />
          <EnamadProofPanel state={state} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('compliance.enamad.stepsTitle')}</CardTitle>
          <CardDescription>{t('compliance.enamad.stepsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <EnamadSteps domain={state.custom_domain} />
        </CardContent>
      </Card>
    </div>
  );
}
