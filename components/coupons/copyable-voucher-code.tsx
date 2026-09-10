'use client';

import { CopyBtn } from '@/components/affiliates/copy-btn';
import { useTranslation } from '@/lib/i18n/hooks';

export function CopyableVoucherCode({ code }: { code: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 font-mono font-medium" dir="ltr">
      <span>{code}</span>
      <CopyBtn text={code} label={t('coupons.bannerCopyCode', { code })} />
    </div>
  );
}
