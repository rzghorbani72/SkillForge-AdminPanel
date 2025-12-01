'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/hooks';

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('products.manageDescription')}
        </p>
      </div>
      <Button onClick={() => router.push('/products/create')}>
        <Plus className="mr-2 h-4 w-4" />
        {t('products.createProduct')}
      </Button>
    </div>
  );
}
