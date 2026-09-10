'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';

export type KycCardFields = {
  cardFrontId: string | null;
  cardBackId: string | null;
  frontPreview: string | null;
  backPreview: string | null;
};

type Props = {
  values: KycCardFields;
  uploading: 'front' | 'back' | null;
  disabled?: boolean;
  onPick: (side: 'front' | 'back', file: File) => void;
};

export function KycStepCard({
  values,
  uploading,
  disabled = false,
  onPick
}: Props) {
  const { t } = useTranslation();
  const frontUrl = values.frontPreview;
  const backUrl = values.backPreview;
  const frontRef = useRef(frontUrl);
  const backRef = useRef(backUrl);

  useEffect(() => {
    if (frontRef.current && frontRef.current !== frontUrl) {
      URL.revokeObjectURL(frontRef.current);
    }
    frontRef.current = frontUrl;
  }, [frontUrl]);

  useEffect(() => {
    if (backRef.current && backRef.current !== backUrl) {
      URL.revokeObjectURL(backRef.current);
    }
    backRef.current = backUrl;
  }, [backUrl]);

  useEffect(() => {
    return () => {
      if (frontRef.current) URL.revokeObjectURL(frontRef.current);
      if (backRef.current) URL.revokeObjectURL(backRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <CardUpload
        id="kyc-card-front"
        label={t('settings.kyc.cardFront')}
        help={t('settings.kyc.cardFrontHelp')}
        preview={frontUrl}
        required
        busy={uploading === 'front'}
        disabled={disabled}
        onPick={(file) => onPick('front', file)}
      />
      <CardUpload
        id="kyc-card-back"
        label={t('settings.kyc.cardBack')}
        help={t('settings.kyc.cardBackHelp')}
        preview={backUrl}
        busy={uploading === 'back'}
        disabled={disabled}
        onPick={(file) => onPick('back', file)}
      />
    </div>
  );
}

function CardUpload({
  id,
  label,
  help,
  preview,
  required,
  busy,
  disabled,
  onPick
}: {
  id: string;
  label: string;
  help: string;
  preview: string | null;
  required?: boolean;
  busy: boolean;
  disabled?: boolean;
  onPick: (file: File) => void;
}) {
  const { t } = useTranslation();
  const blocked = busy || disabled === true;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <p className="text-xs text-muted-foreground">{help}</p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img
          src={preview}
          alt={label}
          className="h-40 w-full max-w-sm rounded-lg border object-cover"
        />
      ) : null}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={blocked}
          asChild
        >
          <label
            htmlFor={id}
            className={blocked ? 'pointer-events-none' : 'cursor-pointer'}
          >
            {busy ? t('common.loading') : t('settings.kyc.uploadCard')}
          </label>
        </Button>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={blocked}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPick(file);
            event.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
