'use client';

import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/hooks';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Input
      placeholder={t('products.searchProducts')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-sm"
    />
  );
}
