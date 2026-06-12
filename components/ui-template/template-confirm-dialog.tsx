'use client';

import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';

export interface TemplateConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  // When set, shows an editable template-name field seeded with this value,
  // so a manager fork commits with the academy name without a blocking prompt.
  defaultName?: string;
  onConfirm: (name?: string) => void;
  onCancel: () => void;
}

export function TemplateConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  defaultName,
  onConfirm,
  onCancel
}: TemplateConfirmDialogProps) {
  const hasNameField = defaultName !== undefined;
  const [name, setName] = useState(defaultName ?? '');

  useEffect(() => {
    if (open) setName(defaultName ?? '');
  }, [open, defaultName]);

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-right sm:text-right">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {hasNameField && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">
              نام قالب اختصاصی
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="نام قالب اختصاصی"
            />
          </div>
        )}

        <AlertDialogFooter className="sm:space-x-reverse">
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={hasNameField && !name.trim()}
            onClick={() => onConfirm(hasNameField ? name.trim() : undefined)}
            className={
              destructive ? 'bg-red-600 text-white hover:bg-red-700' : undefined
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
