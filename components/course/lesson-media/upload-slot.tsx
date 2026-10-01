'use client';

import { Loader2, type LucideIcon } from 'lucide-react';
import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { pickFile } from '@/lib/file-picker';
import { ProgressBar } from './progress-bar';
import { LESSON_MEDIA_SLOT_CLASS } from './shared';

export interface UploadSlotProps {
  label: string;
  Icon: LucideIcon;
  uploadLabel: string;
  accept: string;
  toneClass: string;
  filled: React.ReactNode | null;
  uploading: boolean;
  progress: number;
  hint?: string;
  /** Box size: a 16:9 viewport by default, overridden for info-only slots. */
  boxClass?: string;
  onSelect: (file: File) => void;
  onCancel?: () => void;
}

export function UploadSlot({
  label,
  Icon,
  uploadLabel,
  accept,
  toneClass,
  filled,
  uploading,
  progress,
  hint,
  boxClass = LESSON_MEDIA_SLOT_CLASS,
  onSelect,
  onCancel,
}: UploadSlotProps) {
  const { t } = useTranslation();
  const percentLabel = usePercentLabel();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleActivate(e: React.MouseEvent<HTMLLabelElement>) {
    e.preventDefault();
    const picked = await pickFile(accept);
    if (picked === undefined) {
      inputRef.current?.click();
      return;
    }
    if (picked) onSelect(picked);
  }

  const frameClass = cn(
    'flex shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed px-3 text-center transition-colors',
    boxClass,
    toneClass,
  );

  return (
    <div className="w-full space-y-2">
      {/* Fixed height, top-aligned: a one-line hint and a two-line hint must
          leave the media box at the same Y, or the columns sit out of step. */}
      <div className="flex min-h-8 items-start justify-between gap-2">
        <Label className="shrink-0 text-xs font-medium leading-5 text-muted-foreground">
          {label}
        </Label>
        {hint ? (
          <span className="line-clamp-2 text-end text-[11px] leading-snug text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </div>
      {filled ? (
        filled
      ) : uploading ? (
        <div className={frameClass} role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-sm font-semibold tabular-nums">{percentLabel(progress)}</span>
          <div className="bg-current/15 h-1.5 w-24 overflow-hidden rounded-full">
            <ProgressBar value={progress} />
          </div>
          {onCancel && (
            <button
              type="button"
              className="text-[11px] opacity-70 hover:text-destructive hover:opacity-100"
              onClick={onCancel}
            >
              {t('courses.cancelUpload')}
            </button>
          )}
        </div>
      ) : (
        <label onClick={handleActivate} className={cn(frameClass, 'cursor-pointer')}>
          <span className="bg-current/10 flex h-10 w-10 items-center justify-center rounded-full">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="max-w-[16rem] text-xs font-medium leading-snug">{uploadLabel}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(file);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
