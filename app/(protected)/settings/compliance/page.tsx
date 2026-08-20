'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { SettingsSectionHeader } from '@/components/settings/settings-section-header';
import { EnamadSteps } from '@/components/compliance/enamad-steps';
import { EnamadStatusBadge } from '@/components/compliance/review-status-badge';
import { ENAMAD_STATUS, type EnamadState } from '@/types/compliance';

const ENAMAD_PORTAL = 'https://enamad.ir';

export default function AcademyCompliancePage() {
  const { t } = useTranslation();
  const [state, setState] = useState<EnamadState | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getEnamadState();
      setState(data);
      setCode(data?.code ?? '');
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
      const next = await apiClient.submitEnamadCode(code.trim());
      setState(next);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // eNamad is issued per domain, so it simply does not apply on our subdomain.
  if (!state?.is_required) {
    return (
      <div className="space-y-6 p-6">
        <SettingsSectionHeader
          title={t('compliance.enamad.title')}
          subtitle={t('compliance.enamad.description')}
        />
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            {t('compliance.enamad.subdomainNotice')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isVerified = state.status === ENAMAD_STATUS.VERIFIED;
  const isPending = state.status === ENAMAD_STATUS.PENDING;

  return (
    <div className="space-y-6 p-6">
      <SettingsSectionHeader
        title={t('compliance.enamad.title')}
        subtitle={t('compliance.enamad.description')}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {t('compliance.enamad.statusTitle')}
              </CardTitle>
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

          {isPending ? (
            <Alert>
              <AlertDescription>
                {t('compliance.enamad.pendingNotice')}
              </AlertDescription>
            </Alert>
          ) : null}

          {!isVerified ? (
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                {t('compliance.enamad.requiredNotice')}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="enamad-code">
              {t('compliance.enamad.codeLabel')}
            </Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="enamad-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="12345678"
                inputMode="numeric"
                className="max-w-xs"
                disabled={isVerified}
              />
              <Button
                onClick={submit}
                disabled={saving || isVerified || code.trim().length < 4}
              >
                {t('compliance.enamad.submit')}
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={ENAMAD_PORTAL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="me-1 h-4 w-4" />
                  {t('compliance.enamad.openPortal')}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('compliance.enamad.stepsTitle')}
          </CardTitle>
          <CardDescription>
            {t('compliance.enamad.stepsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnamadSteps domain={state.custom_domain} />
        </CardContent>
      </Card>
    </div>
  );
}
