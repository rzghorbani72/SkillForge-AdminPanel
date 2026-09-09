'use client';

import { Building2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslation } from '@/lib/i18n/hooks';

export default function CreateProductNoAcademyState() {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<Building2 className="h-10 w-10" />}
      title={t('common.noStoreSelected')}
      description={t('common.selectStoreToCreateProduct')}
    />
  );
}
