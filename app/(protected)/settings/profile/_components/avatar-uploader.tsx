'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { AVATAR_ACCEPT } from '../_hooks/use-avatar-upload';

interface AvatarUploaderProps {
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  roleLabel?: string;
  isUploading: boolean;
  progress: number;
  onFile: (file: File) => void;
}

export function AvatarUploader({
  avatarUrl,
  initials,
  displayName,
  roleLabel,
  isUploading,
  progress,
  onFile,
}: AvatarUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = () => {
    if (!isUploading) inputRef.current?.click();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={cn(
        'flex flex-col items-center gap-5 rounded-xl border border-dashed p-5 transition-colors sm:flex-row sm:items-center sm:p-6',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/30 hover:border-primary/40',
      )}
    >
      <button
        type="button"
        onClick={openPicker}
        disabled={isUploading}
        aria-label={t('settings.uploadPhoto')}
        className="group relative shrink-0 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="h-24 w-24 shadow-md ring-2 ring-background sm:h-28 sm:w-28">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1 space-y-2 text-center sm:text-start">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <p className="truncate text-lg font-semibold leading-none">
            {displayName || t('settings.fullNamePlaceholder')}
          </p>
          {roleLabel && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {roleLabel}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{t('settings.photoDropHint')}</p>
        <p className="text-xs text-muted-foreground">{t('settings.photoFormatHint')}</p>

        {isUploading ? (
          <Progress value={progress} className="h-1.5 max-w-xs" />
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={openPicker} className="gap-2">
            <ImagePlus className="h-4 w-4" />
            {avatarUrl ? t('settings.changePhoto') : t('settings.uploadPhoto')}
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT}
        aria-label={t('settings.uploadPhoto')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
