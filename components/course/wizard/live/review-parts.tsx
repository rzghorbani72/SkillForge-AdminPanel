'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { SectionCard } from '@/components/shared/section-card';

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
    <SectionCard
      title={title}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {t('common.edit')}
        </Button>
      }
    >
      {children}
    </SectionCard>
  );
}

export function ReviewRows({ children }: { children: ReactNode }) {
  return (
    <dl className="m-0 grid gap-x-4 gap-y-2.5 sm:grid-cols-[150px_minmax(0,1fr)]">{children}</dl>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="m-0 font-bold">{children}</dd>
    </>
  );
}
