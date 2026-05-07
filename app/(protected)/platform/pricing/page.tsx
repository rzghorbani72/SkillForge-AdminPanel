'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { useAuthUser } from '@/hooks/useAuthUser';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

interface PlatformPricingForm {
  title: string;
  subtitle: string;
  managerCtaLabel: string;
  billingNotes: string;
  faq: string;
}

const STORAGE_KEY = 'platform_pricing_policy_draft_v1';

export default function PlatformPricingPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuthUser();
  const defaultForm = useMemo<PlatformPricingForm>(
    () => ({
      title: t('platform.pricing.defaultTitle'),
      subtitle: t('platform.pricing.defaultSubtitle'),
      managerCtaLabel: t('platform.pricing.defaultCtaLabel'),
      billingNotes: t('platform.pricing.defaultBillingNotes'),
      faq: t('platform.pricing.defaultFaq')
    }),
    [t]
  );
  const [form, setForm] = useState<PlatformPricingForm>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);

  useEffect(() => {
    setForm((prev) => {
      if (
        prev.title !== defaultForm.title ||
        prev.subtitle !== defaultForm.subtitle ||
        prev.managerCtaLabel !== defaultForm.managerCtaLabel ||
        prev.billingNotes !== defaultForm.billingNotes ||
        prev.faq !== defaultForm.faq
      ) {
        return prev;
      }
      return defaultForm;
    });
  }, [defaultForm]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<PlatformPricingForm>;
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid local storage payload
    }
  }, []);

  const handleSave = async () => {
    if (!isPlatformAdmin) return;
    try {
      setIsSaving(true);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      ErrorHandler.showSuccess(t('platform.pricing.saveSuccess'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex-1 p-6" />;
  }

  if (!isPlatformAdmin) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('platform.pricing.accessRestrictedTitle')}</CardTitle>
            <CardDescription>
              {t('platform.pricing.accessRestrictedDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('platform.pricing.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('platform.pricing.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('platform.pricing.managerContentTitle')}</CardTitle>
          <CardDescription>
            {t('platform.pricing.managerContentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">{t('platform.pricing.pageTitle')}</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">{t('platform.pricing.subtitle')}</Label>
            <Textarea
              id="subtitle"
              rows={3}
              value={form.subtitle}
              onChange={(event) =>
                setForm({ ...form, subtitle: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">{t('platform.pricing.ctaLabel')}</Label>
            <Input
              id="cta"
              value={form.managerCtaLabel}
              onChange={(event) =>
                setForm({ ...form, managerCtaLabel: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('platform.pricing.billingNotes')}</Label>
            <Textarea
              id="notes"
              rows={4}
              value={form.billingNotes}
              onChange={(event) =>
                setForm({ ...form, billingNotes: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq">{t('platform.pricing.faq')}</Label>
            <Textarea
              id="faq"
              rows={5}
              value={form.faq}
              onChange={(event) =>
                setForm({ ...form, faq: event.target.value })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? t('platform.pricing.saving')
                : t('platform.pricing.saveDraft')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
