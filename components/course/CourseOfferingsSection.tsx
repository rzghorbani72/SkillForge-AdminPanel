'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import type { OfferingType } from '@/types/api';
import { useCourseOfferings } from '@/hooks/use-course-offerings';

const OFFERING_TYPES: OfferingType[] = [
  'ONE_TIME',
  'SUBSCRIPTION',
  'PRIVATE',
  'PAYMENT_PLAN',
  'FREE'
];

// Editor for a course's pricing offerings. A course may expose several at once
// (one-time + subscription + private). Backed by /course-offerings (staff CRUD).
export function CourseOfferingsSection({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const { offerings, isLoading, isSaving, create, toggleActive, remove } =
    useCourseOfferings(courseId);
  const [type, setType] = useState<OfferingType>('ONE_TIME');
  const [price, setPrice] = useState<string>('');

  const label = (o: OfferingType) => t(`courses.offering${o}` as never);
  const isFree = type === 'FREE';

  const handleAdd = async () => {
    await create({ type, price: isFree ? 0 : Number(price) || 0 });
    setPrice('');
    setType('ONE_TIME');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('courses.offeringsTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('courses.offeringsHint')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLoading && offerings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('courses.noOfferings')}
          </p>
        )}

        <ul className="space-y-2">
          {offerings.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant={o.is_active ? 'default' : 'secondary'}>
                  {label(o.type)}
                </Badge>
                <span className="text-sm tabular-nums">
                  {o.type === 'FREE' ? '—' : o.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  {t('courses.offeringActive')}
                  <Switch
                    checked={o.is_active}
                    disabled={isSaving}
                    onCheckedChange={() => toggleActive(o)}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  onClick={() => remove(o.id)}
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end gap-3 border-t pt-4">
          <div className="min-w-40 space-y-1">
            <span className="text-xs text-muted-foreground">
              {t('courses.offeringType')}
            </span>
            <Select
              value={type}
              onValueChange={(v) => setType(v as OfferingType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFERING_TYPES.map((ot) => (
                  <SelectItem key={ot} value={ot}>
                    {label(ot)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isFree && (
            <div className="min-w-32 space-y-1">
              <span className="text-xs text-muted-foreground">
                {t('courses.offeringPrice')}
              </span>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
          <Button type="button" onClick={handleAdd} disabled={isSaving}>
            <Plus className="mr-1 h-4 w-4" />
            {t('courses.addOffering')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
