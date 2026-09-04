'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  PLATFORM_COST_CATEGORIES,
  PLATFORM_COST_TREE,
  isCostCategory,
  type PlatformCostCategory
} from './cost-categories';

export interface CostFormValues {
  amount_toman: number;
  paid_at: string;
  description: string;
  category: PlatformCostCategory;
  subcategory: string;
}

interface Props {
  busy: boolean;
  onSubmit: (values: CostFormValues) => Promise<void>;
}

function localDateTimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CostForm({ busy, onSubmit }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(() => localDateTimeValue(new Date()));
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlatformCostCategory>('marketing');
  const [subcategory, setSubcategory] = useState<string>('social');

  const subs = useMemo(() => [...PLATFORM_COST_TREE[category]], [category]);

  const submit = async () => {
    const toman = Number(amount);
    if (!Number.isFinite(toman) || toman < 1 || !description.trim()) return;
    await onSubmit({
      amount_toman: Math.round(toman),
      paid_at: new Date(paidAt).toISOString(),
      description: description.trim(),
      category,
      subcategory
    });
    setAmount('');
    setDescription('');
    setPaidAt(localDateTimeValue(new Date()));
  };

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="cost-amount">{t('platformCosts.amount')}</Label>
        <PriceInput
          id="cost-amount"
          value={amount}
          onChange={setAmount}
          suffix={t('platformCosts.toman')}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cost-paid-at">{t('platformCosts.paidAt')}</Label>
        <Input
          id="cost-paid-at"
          type="datetime-local"
          required
          value={paidAt}
          onChange={(event) => setPaidAt(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('platformCosts.category')}</Label>
        <Select
          value={category}
          onValueChange={(value) => {
            if (!isCostCategory(value)) return;
            setCategory(value);
            setSubcategory(PLATFORM_COST_TREE[value][0]);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORM_COST_CATEGORIES.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`platformCosts.categories.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('platformCosts.subcategory')}</Label>
        <Select value={subcategory} onValueChange={setSubcategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subs.map((key) => (
              <SelectItem key={key} value={key}>
                {t(`platformCosts.subcategories.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="cost-description">
          {t('platformCosts.description')}
        </Label>
        <Textarea
          id="cost-description"
          required
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {t('platformCosts.save')}
        </Button>
      </div>
    </form>
  );
}
