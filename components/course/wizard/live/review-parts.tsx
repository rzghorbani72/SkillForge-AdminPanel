'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';

export function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {t('common.edit')}
        </Button>
      </div>
      {children}
    </section>
  );
}

export function ReviewRows({ children }: { children: ReactNode }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">{children}</dl>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </>
  );
}
