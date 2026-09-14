'use client';

import { CopyBtn } from '@/components/affiliates/copy-btn';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/phone-utils';
import { cn } from '@/lib/utils';

export function CopyableId({ value, className }: { value: string; className?: string }) {
  const { t, language } = useTranslation();
  if (!value) return <span>—</span>;

  const display = language === 'fa' ? toPersianDigits(value) : value;

  return (
    <div className={cn('flex min-w-0 items-center gap-1', className)} dir="ltr">
      <span className="truncate font-mono text-xs" title={display}>
        {display}
      </span>
      <CopyBtn text={value} label={t('academiesHealth.copyId')} />
    </div>
  );
}
