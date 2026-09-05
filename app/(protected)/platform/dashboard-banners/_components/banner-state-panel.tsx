'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  apiClient,
  type DashboardBanner,
  type DashboardBannerState
} from '@/lib/api';
import {
  dashboardBannerSrc,
  uploadedImageId
} from '@/lib/dashboard-banner-url';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  state: DashboardBannerState;
  banners: DashboardBanner[];
  onChanged: () => Promise<void>;
};

export function BannerStatePanel({ state, banners, onChanged }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  // One oversized or rejected file must not cancel the rest of the selection,
  // so each file is reported on its own and the loop keeps going.
  const handleUpload = async (files: File[]) => {
    setBusy(true);
    let uploadedCount = 0;

    for (const file of files) {
      try {
        const uploaded = await apiClient.uploadImage(file, {
          title: `dashboard-banner-${state}`
        });
        const imageId = uploadedImageId(uploaded);
        if (!imageId) {
          throw new Error('upload-failed');
        }
        await apiClient.createDashboardBanner({ image_id: imageId, state });
        uploadedCount += 1;
      } catch (error) {
        ErrorHandler.handleApiError(error);
      }
    }

    if (uploadedCount > 0) {
      ErrorHandler.showSuccess(
        t('dashboardBanners.uploadedCount', { count: uploadedCount })
      );
    }
    setBusy(false);
    await onChanged();
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await apiClient.deleteDashboardBanner(id);
      ErrorHandler.showSuccess(t('dashboardBanners.deleted'));
      await onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`dashboardBanners.states.${state}`)}</CardTitle>
        <CardDescription>
          {t(`dashboardBanners.stateHelp.${state}`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length > 0) void handleUpload(files);
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="me-2 h-4 w-4" />
          {t('dashboardBanners.upload')}
        </Button>
        {banners.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('dashboardBanners.empty')}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {banners.map((banner) => (
              <li
                key={banner.id}
                className="overflow-hidden rounded-xl border bg-muted/30"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={dashboardBannerSrc(banner.image_id)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex justify-end p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-destructive"
                    onClick={() => void handleDelete(banner.id)}
                  >
                    <Trash2 className="me-1 h-4 w-4" />
                    {t('dashboardBanners.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
