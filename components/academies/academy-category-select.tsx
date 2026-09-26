'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TranslateFn } from '@/lib/i18n/role-label';

const CATEGORY_KEYS = [
  'language',
  'entrance',
  'programming',
  'design',
  'business',
  'marketing',
  'finance',
  'art',
  'music',
  'math',
  'science',
  'medical',
  'sport',
  'photography',
  'kids',
  'other',
] as const;

function categoryLabelKey(key: string) {
  return `stores.category${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

type AcademyCategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  t: TranslateFn;
};

export function AcademyCategorySelect({ value, onChange, t }: AcademyCategorySelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {t('stores.mainCategory')}
        <span className="ms-1.5 font-normal text-muted-foreground">{t('stores.optionalTag')}</span>
      </label>
      <Select dir="rtl" value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={t('stores.mainCategory')}>
          <SelectValue placeholder={t('stores.categoryPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_KEYS.map((key) => (
            <SelectItem key={key} value={key}>
              {t(categoryLabelKey(key))}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
