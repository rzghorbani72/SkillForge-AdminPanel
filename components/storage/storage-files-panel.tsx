'use client';

import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Music,
  Trash2,
  Video
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  DataList,
  DataPanel,
  type DataColumn
} from '@/components/shared/data-list';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/components/shared/utils';
import {
  apiClient,
  type StorageFileRow,
  type StorageMediaType
} from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { StorageFileUsageCell } from './storage-file-usage-cell';
import { DeleteStorageFileDialog } from './delete-storage-file-dialog';

const KIND_ICON: Record<StorageMediaType, LucideIcon> = {
  video: Video,
  image: ImageIcon,
  audio: Music,
  document: FileText
};

const KIND_FILTERS: (StorageMediaType | 'all')[] = [
  'all',
  'video',
  'image',
  'audio',
  'document'
];

interface StorageFilesPanelProps {
  rows: StorageFileRow[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  kind: StorageMediaType | 'all';
  onKindChange: (kind: StorageMediaType | 'all') => void;
  onPageChange: (page: number) => void;
  onDeleted: () => void;
}

export function StorageFilesPanel({
  rows,
  total,
  page,
  limit,
  isLoading,
  kind,
  onKindChange,
  onPageChange,
  onDeleted
}: StorageFilesPanelProps) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const [pendingDelete, setPendingDelete] = useState<StorageFileRow | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const lastPage = Math.max(1, Math.ceil(total / limit));

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.deleteStorageFile(pendingDelete.kind, pendingDelete.id);
      toast.success(t('storage.deleteSuccess'));
      setPendingDelete(null);
      onDeleted();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataColumn<StorageFileRow>[] = [
    {
      id: 'title',
      header: t('storage.columnFile'),
      cell: (file) => {
        const Icon = KIND_ICON[file.kind];
        return (
          <span className="flex items-center gap-2">
            {file.preview_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaSrc(file.preview_url)}
                alt={file.title}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-md border border-border/60 object-cover"
              />
            ) : (
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">
              {file.title || t(`storage.type${capitalize(file.kind)}`)}
            </span>
          </span>
        );
      }
    },
    {
      id: 'kind',
      header: t('storage.columnType'),
      cell: (file) => t(`storage.type${capitalize(file.kind)}`)
    },
    {
      id: 'size',
      header: t('storage.columnSize'),
      align: 'end',
      cell: (file) => formatFileSize(file.size) || '—'
    },
    {
      id: 'created',
      header: t('storage.columnUploaded'),
      cell: (file) => formatDate(file.created_at)
    },
    {
      id: 'usage',
      header: t('storage.columnUsedIn'),
      cell: (file) => <StorageFileUsageCell usages={file.usages} />
    },
    {
      id: 'actions',
      header: '',
      align: 'end',
      // Only an upload nothing points at can be removed here; anything in use is
      // deleted from the lesson, course or page that owns it.
      cell: (file) =>
        file.usages.length === 0 ? (
          <Button
            variant="ghost"
            size="sm"
            title={t('storage.delete')}
            onClick={() => setPendingDelete(file)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null
    }
  ];

  return (
    <>
      <DataPanel
        title={t('storage.filesTitle')}
        subtitle={t('storage.filesDescription')}
        filters={KIND_FILTERS.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={kind === option ? 'default' : 'outline'}
            onClick={() => onKindChange(option)}
          >
            {option === 'all'
              ? t('storage.filterAll')
              : t(`storage.type${capitalize(option)}`)}
          </Button>
        ))}
        footer={
          total > limit ? (
            <>
              <span className="text-xs text-muted-foreground">
                {t('storage.pageOf', {
                  page: formatNumber(page),
                  total: formatNumber(lastPage)
                })}
              </span>
              <span className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => onPageChange(page + 1)}
                >
                  {t('common.next')}
                </Button>
              </span>
            </>
          ) : null
        }
      >
        <DataList
          items={rows}
          columns={columns}
          rowKey={(file) => `${file.kind}:${file.id}`}
          isLoading={isLoading}
          emptyState={
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {t('storage.noFiles')}
            </p>
          }
        />
      </DataPanel>

      <DeleteStorageFileDialog
        file={pendingDelete}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

/** Media URLs come back as API-relative paths, same as every other media list. */
const resolveMediaSrc = (url: string) =>
  url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}` : url;
