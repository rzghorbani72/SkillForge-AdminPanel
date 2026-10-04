'use client';

import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n/hooks';

/** A form label with the red star for required fields. */
export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      {required ? (
        <span aria-hidden className="ms-0.5 text-destructive">
          *
        </span>
      ) : null}
    </Label>
  );
}

/** An inline field error from a translation key; renders nothing without one. */
export function FieldError({ messageKey }: { messageKey?: string }) {
  const { t } = useTranslation();
  if (!messageKey) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
      <CircleAlert className="h-4 w-4 shrink-0" aria-hidden />
      {t(messageKey)}
    </p>
  );
}
