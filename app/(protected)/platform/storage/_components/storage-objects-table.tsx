'use client';

import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DataList,
  DataPanel,
  type DataColumn
} from '@/components/shared/data-list';
import { formatFileSize } from '@/components/shared/utils';
import type { StorageObject } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';

type Filter = 'all' | 'used' | 'unused';

interface StorageObjectsTableProps {
  objects: readonly StorageObject[];
  loading: boolean;
  onDelete: (keys: string[]) => Promise<void>;
}

export function StorageObjectsTable({
  objects,
  loading,
  onDelete
}: StorageObjectsTableProps) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const [filter, setFilter] = useState<Filter>('unused');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(
    () =>
      objects.filter((o) =>
        filter === 'all' ? true : filter === 'used' ? o.used : !o.used
      ),
    [objects, filter]
  );
  const unusedVisibleKeys = visible.filter((o) => !o.used).map((o) => o.key);
  const allUnusedSelected =
    unusedVisibleKeys.length > 0 &&
    unusedVisibleKeys.every((key) => selected.has(key));

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = () =>
    setSelected(allUnusedSelected ? new Set() : new Set(unusedVisibleKeys));

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(Array.from(selected));
      setSelected(new Set());
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const fileName = (key: string) => key.slice(key.lastIndexOf('/') + 1);

  const columns: DataColumn<StorageObject>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={allUnusedSelected}
          onCheckedChange={toggleAll}
          disabled={unusedVisibleKeys.length === 0}
          aria-label={t('platformStorage.selectAllUnused')}
        />
      ),
      cell: (o) =>
        o.used ? null : (
          <Checkbox
            checked={selected.has(o.key)}
            onCheckedChange={() => toggle(o.key)}
            aria-label={fileName(o.key)}
          />
        ),
      className: 'w-10'
    },
    {
      id: 'file',
      header: t('platformStorage.file'),
      cell: (o) => (
        <span className="block max-w-[320px] truncate" title={o.key} dir="ltr">
          {fileName(o.key)}
        </span>
      )
    },
    {
      id: 'academy',
      header: t('platformStorage.academy'),
      cell: (o) => o.academy_name ?? t('platformStorage.platformScope')
    },
    {
      id: 'size',
      header: t('platformStorage.size'),
      cell: (o) => formatFileSize(o.size) || '—',
      align: 'end'
    },
    {
      id: 'modified',
      header: t('platformStorage.lastModified'),
      cell: (o) => (o.last_modified ? formatDate(o.last_modified) : '—')
    },
    {
      id: 'status',
      header: t('platformStorage.status'),
      cell: (o) => (
        <Badge variant={o.used ? 'secondary' : 'destructive'}>
          {o.used ? t('platformStorage.used') : t('platformStorage.unused')}
        </Badge>
      )
    }
  ];

  return (
    <DataPanel
      title={t('platformStorage.objectsTitle')}
      subtitle={t('platformStorage.objectsHint')}
      filters={
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="unused">
              {t('platformStorage.unused')}
            </TabsTrigger>
            <TabsTrigger value="used">{t('platformStorage.used')}</TabsTrigger>
            <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      actions={
        <Button
          variant="destructive"
          size="sm"
          disabled={selected.size === 0}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          {t('platformStorage.deleteSelected', { count: selected.size })}
        </Button>
      }
    >
      <DataList
        items={visible}
        columns={columns}
        rowKey={(o) => o.key}
        isLoading={loading}
        emptyState={
          <p className="p-6 text-center text-sm text-muted-foreground">
            {t('platformStorage.empty')}
          </p>
        }
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('platformStorage.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('platformStorage.confirmDescription', {
                count: selected.size
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DataPanel>
  );
}
