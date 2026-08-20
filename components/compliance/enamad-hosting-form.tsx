'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { ENAMAD_STATUS, type EnamadState } from '@/types/compliance';

type Props = {
  state: EnamadState;
  code: string;
  sealId: string;
  saving: boolean;
  onCodeChange: (value: string) => void;
  onSealIdChange: (value: string) => void;
  onSubmit: () => void;
  onSaveSealId: () => void;
  onTitleVerify: (enabled: boolean) => void;
};

export function EnamadHostingForm({
  state,
  code,
  sealId,
  saving,
  onCodeChange,
  onSealIdChange,
  onSubmit,
  onSaveSealId,
  onTitleVerify
}: Props) {
  const { t } = useTranslation();
  const isVerified = state.status === ENAMAD_STATUS.VERIFIED;
  const sealDirty =
    sealId.trim().length > 0 && sealId.trim() !== (state.seal_id ?? '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="enamad-code">{t('compliance.enamad.codeLabel')}</Label>
        <Input
          id="enamad-code"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="56180294"
          inputMode="numeric"
          className="max-w-xs"
          disabled={isVerified}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enamad-seal-id">
          {t('compliance.enamad.sealIdLabel')}
        </Label>
        <p className="text-sm text-muted-foreground">
          {t('compliance.enamad.sealIdHelp')}
        </p>
        <Input
          id="enamad-seal-id"
          value={sealId}
          onChange={(event) => onSealIdChange(event.target.value)}
          placeholder="123456"
          inputMode="numeric"
          className="max-w-xs"
          disabled={isVerified}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onSubmit}
          disabled={saving || isVerified || code.trim().length < 4}
        >
          {t('compliance.enamad.submit')}
        </Button>
        {state.proofs_live && sealDirty ? (
          <Button
            variant="secondary"
            onClick={onSaveSealId}
            disabled={saving || isVerified}
          >
            {t('compliance.enamad.saveSealId')}
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <a href="https://enamad.ir" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="me-1 h-4 w-4" />
            {t('compliance.enamad.openPortal')}
          </a>
        </Button>
      </div>

      {state.proofs_live ? (
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">
              {t('compliance.enamad.titleVerifyLabel')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('compliance.enamad.titleVerifyHelp')}
            </p>
          </div>
          <Switch
            checked={state.title_verify}
            disabled={saving || isVerified}
            onCheckedChange={onTitleVerify}
            aria-label={t('compliance.enamad.titleVerifyLabel')}
          />
        </div>
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {t('compliance.enamad.submitToPlaceProofs')}
          </AlertDescription>
        </Alert>
      )}

      {state.footer_live ? (
        <Badge variant="secondary">{t('compliance.enamad.footerLive')}</Badge>
      ) : null}
    </div>
  );
}
