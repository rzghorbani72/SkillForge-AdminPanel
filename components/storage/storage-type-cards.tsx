'use client';

import { FileText, Image as ImageIcon, Music, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/components/shared/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import { cn } from '@/lib/utils';
import type { AcademyStorageTypeUsage, StorageMediaType } from '@/lib/api';

const TYPE_META: Record<StorageMediaType, { icon: LucideIcon; labelKey: string; color: string }> = {
  video: { icon: Video, labelKey: 'storage.typeVideo', color: 'text-sky-600' },
  image: {
    icon: ImageIcon,
    labelKey: 'storage.typeImage',
    color: 'text-emerald-600',
  },
  audio: {
    icon: Music,
    labelKey: 'storage.typeAudio',
    color: 'text-violet-600',
  },
  document: {
    icon: FileText,
    labelKey: 'storage.typeDocument',
    color: 'text-amber-600',
  },
};

interface StorageTypeCardsProps {
  items: AcademyStorageTypeUsage[];
  totalBytes: number;
}

export function StorageTypeCards({ items, totalBytes }: StorageTypeCardsProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const percentLabel = usePercentLabel();
  const emptySize = `${formatNumber(0)} ${t('media.unitMb')}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        const share = totalBytes > 0 ? (item.bytes / totalBytes) * 100 : 0;

        return (
          <Card key={item.type}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className={cn('h-4 w-4', meta.color)} />
                  {t(meta.labelKey)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('storage.fileCount', { count: formatNumber(item.count) })}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {formatFileSize(item.bytes) || emptySize}
              </p>
              <Progress value={share} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {t('storage.shareOfTotal', { percent: percentLabel(share) })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
