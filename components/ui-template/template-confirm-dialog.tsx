'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface TemplateConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  // When set, the fork commits under this name. The platform owns it — one
  // template per academy, named "<academy> - <preset>" — so it is shown for
  // confirmation but never editable.
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
  onCancel,
}: TemplateConfirmDialogProps) {
  const hasNameField = defaultName !== undefined;
  const name = defaultName ?? '';

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-right sm:text-right">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {hasNameField && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">نام قالب اختصاصی</span>
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-semibold">{name}</p>
          </div>
        )}

        <AlertDialogFooter className="sm:space-x-reverse">
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction
            disabled={hasNameField && !name.trim()}
            onClick={() => onConfirm(hasNameField ? name.trim() : undefined)}
            className={destructive ? 'bg-red-600 text-white hover:bg-red-700' : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
