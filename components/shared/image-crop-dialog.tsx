'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { cropImageFile, type CropPreset } from '@/lib/image-crop';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export interface ImageCropDialogProps {
  file: File | null;
  preset: CropPreset;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

const MAX_ZOOM = 3;

export function ImageCropDialog({ file, preset, onCancel, onCropped }: ImageCropDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('media.cropTitle')}</DialogTitle>
          <DialogDescription>{t('media.cropHint')}</DialogDescription>
        </DialogHeader>
        {file && <CropBody file={file} preset={preset} onCancel={onCancel} onCropped={onCropped} />}
      </DialogContent>
    </Dialog>
  );
}

function CropBody({ file, preset, onCancel, onCropped }: ImageCropDialogProps & { file: File }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<Area | null>(null);
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

  const handleConfirm = async () => {
    if (!areaRef.current) return;
    setSaving(true);
    try {
      onCropped(await cropImageFile(file, areaRef.current, preset.maxWidth));
    } catch (error) {
      logger.error('Images', 'CropFailed', errorFields(error));
      toast.error(t('media.cropFailed'));
      setSaving(false);
    }
  };

  return (
    <>
      {/* The cropper math assumes LTR; RTL would mirror the drag direction. */}
      <div dir="ltr" className="relative h-72 w-full overflow-hidden rounded-lg bg-muted sm:h-80">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          maxZoom={MAX_ZOOM}
          aspect={preset.aspect}
          cropShape={preset.shape}
          showGrid={preset.shape === 'rect'}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, pixels) => {
            areaRef.current = pixels;
          }}
        />
      </div>
      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        {t('media.cropZoom')}
        <Slider
          min={1}
          max={MAX_ZOOM}
          step={0.05}
          value={[zoom]}
          onValueChange={([value]) => setZoom(value ?? 1)}
        />
      </label>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button type="button" onClick={() => void handleConfirm()} disabled={saving}>
          {saving && <Loader2 className="me-1.5 h-4 w-4 animate-spin" />}
          {t('media.cropConfirm')}
        </Button>
      </DialogFooter>
    </>
  );
}
