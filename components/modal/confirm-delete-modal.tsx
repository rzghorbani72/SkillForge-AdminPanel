'use client';

import React from 'react';
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
import { useTranslation } from '@/lib/i18n/hooks';

interface ConfirmDeleteModalProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title of the item being deleted */
  title: string;
  /** Description/type of the item being deleted (e.g., "image", "course", "lesson") */
  itemType?: string;
  /** Optional additional description text */
  description?: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Whether the delete action is in progress */
  isLoading?: boolean;
  /** Custom confirmation button text */
  confirmText?: string;
  /** Custom cancel button text */
  cancelText?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onOpenChange,
  title,
  itemType = 'item',
  description,
  onConfirm,
  isLoading = false,
  confirmText,
  cancelText
}) => {
  const { t } = useTranslation();
  const handleConfirm = () => {
    onConfirm();
  };

  const defaultConfirmText = confirmText || t('common.delete');
  const defaultCancelText = cancelText || t('common.cancel');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('modal.confirmDelete')}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
              <>
                {t('common.cannotBeUndone')} {t('common.permanentlyDelete')}{' '}
                {itemType} <strong>"{title}"</strong>.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {defaultCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('modal.deleting') : defaultConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteModal;
