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
import { useAuthUser } from '@/hooks/useAuthUser';
import { ErrorHandler } from '@/lib/error-handler';

interface PlatformPricingForm {
  title: string;
  subtitle: string;
  managerCtaLabel: string;
  billingNotes: string;
  faq: string;
}

const STORAGE_KEY = 'platform_pricing_policy_draft_v1';

const DEFAULT_FORM: PlatformPricingForm = {
  title: 'Platform Plans',
  subtitle: 'Pricing and monetization policy for academy managers.',
  managerCtaLabel: 'Start Platform Plan',
  billingNotes:
    'Billing cycle, overage terms, VAT/tax notes, and settlement policy.',
  faq: 'Add platform-level FAQs for managers here.'
};

export default function PlatformPricingPage() {
  const { user, isLoading } = useAuthUser();
  const [form, setForm] = useState<PlatformPricingForm>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const isPlatformAdmin =
    user?.role === 'ADMIN' && (user?.isAdminProfile || user?.platformLevel);

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
      ErrorHandler.showSuccess('Platform pricing draft saved');
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
            <CardTitle>Access restricted</CardTitle>
            <CardDescription>
              Platform pricing policy can only be edited by platform admins.
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
          Platform Pricing Policy
        </h1>
        <p className="text-muted-foreground">
          Manage platform monetization copy for academy managers (not student
          pricing).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manager-facing monetization content</CardTitle>
          <CardDescription>
            Define Group plans, overage policy, billing notes, and platform
            FAQs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Page title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
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
            <Label htmlFor="cta">CTA label</Label>
            <Input
              id="cta"
              value={form.managerCtaLabel}
              onChange={(event) =>
                setForm({ ...form, managerCtaLabel: event.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Billing notes</Label>
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
            <Label htmlFor="faq">FAQ</Label>
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
              {isSaving ? 'Saving...' : 'Save draft'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
