'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiClient, type SubscriptionPlanData } from '@/lib/api';
import { formatStorage } from '@/components/plans/plan-types';

const STEPS = ['stepSpecs', 'stepBranding', 'stepPlan'] as const;

const BRAND_COLORS: { hex: string; tw: string }[] = [
  { hex: '#6366f1', tw: 'bg-[#6366f1]' },
  { hex: '#8b5cf6', tw: 'bg-[#8b5cf6]' },
  { hex: '#ec4899', tw: 'bg-[#ec4899]' },
  { hex: '#ef4444', tw: 'bg-[#ef4444]' },
  { hex: '#f97316', tw: 'bg-[#f97316]' },
  { hex: '#eab308', tw: 'bg-[#eab308]' },
  { hex: '#22c55e', tw: 'bg-[#22c55e]' },
  { hex: '#14b8a6', tw: 'bg-[#14b8a6]' },
  { hex: '#06b6d4', tw: 'bg-[#06b6d4]' },
  { hex: '#3b82f6', tw: 'bg-[#3b82f6]' },
  { hex: '#64748b', tw: 'bg-[#64748b]' },
  { hex: '#1e293b', tw: 'bg-[#1e293b]' }
];

type Category = { key: string; label: string };

type AcademyCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    slug: string;
    description?: string;
    category?: string;
    logoId?: number;
    primaryColor?: string;
    selectedPlan?: SubscriptionPlanData;
  }) => Promise<void>;
  t: (k: string) => string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

export function AcademyCreateModal({
  open,
  onClose,
  onSubmit,
  t
}: AcademyCreateModalProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0 — Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Step 1 — Branding
  const [logoId, setLogoId] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(BRAND_COLORS[0].hex);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Step 2 — Plan
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanData | null>(
    null
  );

  const categories: Category[] = [
    { key: 'programming', label: t('stores.categoryProgramming') },
    { key: 'design', label: t('stores.categoryDesign') },
    { key: 'language', label: t('stores.categoryLanguage') },
    { key: 'business', label: t('stores.categoryBusiness') },
    { key: 'entrance', label: t('stores.categoryEntrance') },
    { key: 'art', label: t('stores.categoryArt') },
    { key: 'finance', label: t('stores.categoryFinance') }
  ];

  useEffect(() => {
    if (step !== 2 || plans.length > 0) return;
    setLoadingPlans(true);
    apiClient
      .getActivePlans()
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));
  }, [step, plans.length]);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(toSlug(value));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    try {
      const uploaded = await apiClient.uploadImage(file);
      const imageData = (uploaded as any)?.data ?? uploaded;
      if (imageData?.id) setLogoId(imageData.id);
    } catch {
      setLogoPreview('');
      setLogoId(null);
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleClose() {
    setStep(0);
    setName('');
    setSlug('');
    setDescription('');
    setCategory('');
    setLogoId(null);
    setLogoPreview('');
    setPrimaryColor(BRAND_COLORS[0].hex);
    setPlans([]);
    setSelectedPlan(null);
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        slug,
        description,
        category,
        logoId: logoId ?? undefined,
        primaryColor,
        selectedPlan: selectedPlan ?? undefined
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  const stepKeys = STEPS.map((k) => t(`stores.${k}`));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[560px]" dir="rtl">
        <DialogHeader className="text-right">
          <p className="text-xs text-muted-foreground">
            {t('stores.createModalTitle')}
          </p>
          <DialogTitle className="text-xl">
            {t('stores.createModalHeading')}
          </DialogTitle>
        </DialogHeader>

        {/* Step tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {stepKeys.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                i === step
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : i < step
                    ? 'text-foreground hover:bg-background/50'
                    : 'cursor-default text-muted-foreground'
              )}
            >
              <span className="bg-current/20 mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>{' '}
              {label}
            </button>
          ))}
        </div>

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.academyName')}
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('stores.academyNamePlaceholder')}
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('stores.subdomain')}
                </label>
                <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    value={slug}
                    onChange={(e) => setSlug(toSlug(e.target.value))}
                    placeholder="mehr"
                    dir="ltr"
                    aria-label={t('stores.subdomain')}
                  />
                  <span className="shrink-0 border-r bg-muted px-3 py-2 text-xs text-muted-foreground">
                    mentoryar.ir
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('stores.mainCategory')}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setCategory(category === cat.key ? '' : cat.key)
                    }
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      category === cat.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary/50'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('stores.shortDescription')}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('stores.shortDescriptionPlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 1 — Branding */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('stores.brandingLogo')}
              </label>
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingLogo ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {t('stores.brandingLogoHint')}
                    </p>
                  </>
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                aria-label={t('stores.brandingLogo')}
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t('stores.brandingColor')}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {BRAND_COLORS.map(({ hex, tw }) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={hex}
                    onClick={() => setPrimaryColor(hex)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                      tw,
                      primaryColor === hex
                        ? 'scale-110 border-foreground shadow-md'
                        : 'border-transparent'
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {primaryColor}
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex w-fit rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  period === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('plans.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className={cn(
                  'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                  period === 'yearly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('plans.yearly')}
              </button>
            </div>

            {loadingPlans ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                {t('plans.noPlanConfigured')}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const price =
                    period === 'yearly' && plan.price_yearly != null
                      ? plan.price_yearly
                      : plan.price_monthly;
                  const selected = selectedPlan?.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(selected ? null : plan)}
                      className={cn(
                        'relative flex flex-col gap-2 rounded-xl border p-4 text-right transition-colors',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {selected && (
                        <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      <p className="text-sm font-semibold">{plan.name}</p>
                      <p className="text-xl font-bold">
                        {price.toLocaleString('fa-IR')}
                        <span className="mr-1 text-xs font-normal text-muted-foreground">
                          {period === 'monthly'
                            ? t('plans.pricePerMonth')
                            : t('plans.pricePerYear')}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('plans.storage')}:{' '}
                        {formatStorage(plan.storage_limit_gb)}
                      </p>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                              <Check className="h-3 w-3 shrink-0 text-primary" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {t('stores.planStepHint')}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            {t('stores.cancel')}
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t('stores.draft')}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && (!name.trim() || !slug.trim())}
              >
                {t('stores.nextStep')} &lsaquo;
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={saving}>
                {saving && (
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                {t('common.create')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
