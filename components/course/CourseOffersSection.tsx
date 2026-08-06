'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PriceInput } from '@/components/ui/price-input';
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
import type { Offer, OfferingType } from '@/types/api';
import { useCourseOffers } from '@/hooks/use-course-offers';
import {
  DEFAULT_ACCESS_DAYS,
  PLATFORM_MAX_ACCESS_DAYS,
  accessTermDays
} from '@/lib/access-term';

// PRIVATE and PAYMENT_PLAN are excluded: private tutoring sells through the
// tutoring module, and installments are not offered yet — that will arrive as
// a Snapp Pay gateway integration, not an offer type. The API refuses both.
const OFFER_TYPES: OfferingType[] = ['ONE_TIME', 'SUBSCRIPTION', 'FREE'];

// Editor for the ways a course can be bought. Every offer here is a separate
// purchasable option; the one carrying the course's own price is managed from
// the course form instead, so it is listed read-only.
export function CourseOffersSection({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const { offers, isLoading, isSaving, create, toggleActive, remove } =
    useCourseOffers(courseId);
  const [type, setType] = useState<OfferingType>('ONE_TIME');
  const [price, setPrice] = useState<string>('');
  const [accessDays, setAccessDays] = useState<string>('');

  const label = (o: OfferingType) => t(`courses.offering${o}` as never);
  const isFree = type === 'FREE';
  const isCoursePrice = (o: Offer) => o.source_course_id !== null;

  const handleAdd = async () => {
    await create({
      type,
      price: isFree ? 0 : Number(price) || 0,
      access_duration_days: Number(accessDays) || null
    });
    setPrice('');
    setAccessDays('');
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
        {!isLoading && offers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('courses.noOfferings')}
          </p>
        )}

        <ul className="space-y-2">
          {offers.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant={o.is_active ? 'default' : 'secondary'}>
                  {o.title ?? label(o.type)}
                </Badge>
                <span className="text-sm tabular-nums">
                  {o.type === 'FREE' ? '—' : o.price.toLocaleString()}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {t('courses.offeringAccessDaysValue', {
                    days: accessTermDays(o.access_duration_days, null)
                  })}
                </span>
                {isCoursePrice(o) && (
                  <span className="text-xs text-muted-foreground">
                    {t('courses.offerFromCoursePrice')}
                  </span>
                )}
              </div>
              {!isCoursePrice(o) && (
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
              )}
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
                {OFFER_TYPES.map((ot) => (
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
              <PriceInput
                value={price}
                onChange={setPrice}
                suffix={t('courses.toman' as never)}
              />
            </div>
          )}
          <div className="min-w-32 space-y-1">
            <span className="text-xs text-muted-foreground">
              {t('courses.offeringAccessDays')}
            </span>
            <Input
              type="number"
              min={1}
              max={PLATFORM_MAX_ACCESS_DAYS}
              placeholder={String(DEFAULT_ACCESS_DAYS)}
              value={accessDays}
              onChange={(e) => setAccessDays(e.target.value)}
            />
            <span className="block text-[11px] text-muted-foreground">
              {t('courses.offeringAccessDaysHint', {
                days: DEFAULT_ACCESS_DAYS
              })}
            </span>
          </div>
          <Button type="button" onClick={handleAdd} disabled={isSaving}>
            <Plus className="mr-1 h-4 w-4" />
            {t('courses.addOffering')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
