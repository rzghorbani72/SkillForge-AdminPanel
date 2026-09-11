'use client';

import { useEffect, useRef } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

export type KycCardFields = {
  cardFrontId: string | null;
  cardBackId: string | null;
  frontPreview: string | null;
  backPreview: string | null;
};

const NATIONAL_CARD_FRAME = 'aspect-[86/54]';

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
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <CardSlot
        id="kyc-card-front"
        label={t('settings.kyc.cardFront')}
        help={t('settings.kyc.cardFrontHelp')}
        preview={frontUrl}
        required
        busy={uploading === 'front'}
        disabled={disabled}
        onPick={(file) => onPick('front', file)}
      />
      <CardSlot
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

function CardSlot({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const blocked = busy || disabled === true;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <p className="text-xs text-muted-foreground">{help}</p>
      <button
        id={id}
        type="button"
        disabled={blocked}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative w-full overflow-hidden rounded-lg border-2 bg-muted/40',
          NATIONAL_CARD_FRAME,
          preview
            ? 'border-solid border-border'
            : 'border-dashed border-muted-foreground/30',
          !blocked && 'cursor-pointer hover:border-primary/60 hover:bg-muted/70'
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img
              src={preview}
              alt={label}
              className="absolute inset-0 h-full w-full object-contain"
            />
            {!busy ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {t('media.changeImage')}
              </span>
            ) : null}
          </>
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {t('settings.kyc.uploadCard')}
            </span>
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        className="hidden"
        disabled={blocked}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
