'use client';

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
import { formatFileSize } from '@/components/shared/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import type { StorageFileRow } from '@/lib/api';

interface DeleteStorageFileDialogProps {
  file: StorageFileRow | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Deleting removes the file from the bucket for good — say so before it happens. */
export function DeleteStorageFileDialog({
  file,
  isDeleting,
  onCancel,
  onConfirm
}: DeleteStorageFileDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('storage.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('storage.deleteConfirm', {
              name: file?.title ?? '',
              size: formatFileSize(file?.size) || ''
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('storage.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
