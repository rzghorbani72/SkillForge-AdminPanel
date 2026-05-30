'use client';

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'حذف',
  cancelLabel = 'انصراف'
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      {/*
        dir="rtl" makes flex-row flow right→left:
        first child (text) lands on the RIGHT,
        second child (icon) lands on the LEFT
      */}
      <AlertDialogContent
        className="max-w-sm gap-5"
        style={{ direction: 'rtl' }}
      >
        <div className="space-y-3">
          <div dir="ltr" className="flex items-center justify-between">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-right text-[15px] font-semibold">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-right text-[13px] leading-relaxed">
            {description}
          </AlertDialogDescription>
        </div>

        {/* cancel on right, delete on left (RTL row order) */}
        <AlertDialogFooter className="flex-row gap-2 sm:space-x-0">
          <AlertDialogCancel onClick={onCancel} className="flex-1">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
