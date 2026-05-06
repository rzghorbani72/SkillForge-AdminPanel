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
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';

interface PricingConfigForm {
  title: string;
  subtitle: string;
  cta_label: string;
}

const DEFAULT_FORM: PricingConfigForm = {
  title: '',
  subtitle: '',
  cta_label: ''
};

export default function PricingSettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const [form, setForm] = useState<PricingConfigForm>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);
  const canManageAcademyPricing =
    !isPlatformAdmin && (user?.role === 'MANAGER' || user?.role === 'ADMIN');

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const data =
        (await apiClient.getCurrentPricingConfig()) as Partial<PricingConfigForm> | null;
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

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!canManageAcademyPricing) return;
    try {
      setIsSaving(true);
      await apiClient.updateCurrentPricingConfig({
        title: form.title,
        subtitle: form.subtitle,
        cta_label: form.cta_label
      });
      ErrorHandler.showSuccess(t('settings.pricingUpdatedSuccess'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-[260px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.pricingCmsTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.pricingCmsSubtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.publicPricingContentTitle')}</CardTitle>
          <CardDescription>
            {t('settings.publicPricingContentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!canManageAcademyPricing ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              This page is for academy-level pricing communication (students
              pay). Platform pricing policy (managers pay) is managed by
              platform admins in the platform pricing page.
              <div className="mt-3">
                <Button asChild size="sm" variant="outline">
                  <Link href="/platform/pricing">Open Platform Pricing</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {canManageAcademyPricing ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              Manager scope: customize academy pricing copy shown to students
              for your academy.
            </div>
          ) : null}

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
              disabled={!canManageAcademyPricing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing-subtitle">
              {t('settings.pricingSubtitleLabel')}
            </Label>
            <Textarea
              id="pricing-subtitle"
              rows={4}
              value={form.subtitle}
              onChange={(event) =>
                setForm({ ...form, subtitle: event.target.value })
              }
              placeholder={t('settings.pricingSubtitlePlaceholder')}
              disabled={!canManageAcademyPricing}
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
              disabled={!canManageAcademyPricing}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || !canManageAcademyPricing}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
