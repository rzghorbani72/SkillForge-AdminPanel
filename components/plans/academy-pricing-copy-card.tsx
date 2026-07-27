'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';

interface PricingCopy {
  title: string;
  subtitle: string;
  cta_label: string;
}

const EMPTY_COPY: PricingCopy = { title: '', subtitle: '', cta_label: '' };

interface Props {
  canManage: boolean;
  t: (key: string) => string;
}

export function AcademyPricingCopyCard({ canManage, t }: Props) {
  const [form, setForm] = useState<PricingCopy>(EMPTY_COPY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          (await apiClient.getCurrentPricingConfig()) as Partial<PricingCopy> | null;
        setForm({
          title: data?.title ?? '',
          subtitle: data?.subtitle ?? '',
          cta_label: data?.cta_label ?? ''
        });
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    if (!canManage) return;
    try {
      setIsSaving(true);
      await apiClient.updateCurrentPricingConfig(form);
      ErrorHandler.showSuccess(t('settings.pricingUpdatedSuccess'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-[260px]" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.publicPricingContentTitle')}</CardTitle>
        <CardDescription>
          {t('settings.publicPricingContentDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pricing-title">
            {t('settings.pricingPageTitleLabel')}
          </Label>
          <Input
            id="pricing-title"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder={t('settings.pricingPageTitlePlaceholder')}
            disabled={!canManage}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing-subtitle">
            {t('settings.pricingSubtitleLabel')}
          </Label>
          <Textarea
            id="pricing-subtitle"
            rows={3}
            value={form.subtitle}
            onChange={(event) =>
              setForm({ ...form, subtitle: event.target.value })
            }
            placeholder={t('settings.pricingSubtitlePlaceholder')}
            disabled={!canManage}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricing-cta">{t('settings.pricingCtaLabel')}</Label>
          <Input
            id="pricing-cta"
            value={form.cta_label}
            onChange={(event) =>
              setForm({ ...form, cta_label: event.target.value })
            }
            placeholder={t('settings.pricingCtaPlaceholder')}
            disabled={!canManage}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !canManage}>
            <Save className="me-2 h-4 w-4" />
            {isSaving ? t('settings.saving') : t('settings.saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
