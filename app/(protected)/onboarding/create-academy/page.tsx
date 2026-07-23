'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Globe, ArrowLeft, CheckCircle2, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toast } from 'react-toastify';
import { useStore } from '@/hooks/useStore';
import { clearAcademyData, setSelectedAcademyId } from '@/lib/store-utils';
import { cn } from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────

const useAcademySchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(2, t('auth.fullNameRequired')).max(60),
    slug: z
      .string()
      .min(2, t('auth.storeSlugRequired'))
      .max(40)
      .regex(/^[a-z0-9-]+$/, t('auth.storeSlugInvalid')),
    description: z.string().max(300).optional()
  });

type AcademyValues = { name: string; slug: string; description?: string };

const TOTAL_STEPS = 4;

const PRESET_COLORS = [
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#6366F1', label: 'Indigo' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#F97316', label: 'Orange' },
  { hex: '#22C55E', label: 'Green' },
  { hex: '#14B8A6', label: 'Teal' },
  { hex: '#EF4444', label: 'Red' }
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

// ─── Progress dots ────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i + 1 === current
              ? 'w-8 bg-primary'
              : i + 1 < current
                ? 'w-2 bg-primary/50'
                : 'w-2 bg-muted-foreground/20'
          )}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CreateAcademyPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { refreshAcademies } = useStore();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const postCreateHref = planParam
    ? `/plans?plan=${encodeURIComponent(planParam)}`
    : '/dashboard';
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(PRESET_COLORS[0].hex);

  const form = useForm<AcademyValues>({
    resolver: zodResolver(useAcademySchema(t)),
    defaultValues: { name: '', slug: '', description: '' }
  });

  const slug = form.watch('slug');

  function handleNameChange(value: string) {
    form.setValue('name', value);
    const currentSlug = form.getValues('slug');
    const prev = toSlug(
      form.getValues('name').slice(0, value.length - 1) || ''
    );
    if (!currentSlug || currentSlug === prev) {
      form.setValue('slug', toSlug(value), { shouldValidate: false });
    }
  }

  async function goNext() {
    if (step === 1) {
      const valid = await form.trigger('name');
      if (valid) setStep((s) => s + 1);
    } else if (step === 2) {
      const valid = await form.trigger('slug');
      if (valid) setStep((s) => s + 1);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function submit() {
    const values = form.getValues();
    setSaving(true);
    try {
      const response = await apiClient.createAcademy({
        name: values.name,
        private_domain: values.slug,
        description: values.description || undefined
      });
      const newId =
        (response as any)?.data?.id ??
        (response as any)?.data?.data?.id ??
        (response as any)?.id;
      if (newId) {
        await apiClient.switchAcademy(newId);
        clearAcademyData();
        setSelectedAcademyId(newId);
        await apiClient.updateCurrentThemeConfig({
          primary_color: primaryColor
        });
      }
      await refreshAcademies();
      setCreated(true);
      toast.success(t('auth.academyCreatedTitle'));
      setTimeout(() => {
        window.location.href = postCreateHref;
      }, 1500);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  // ─── Success ─────────────────────────────────────────────────────────────

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="text-2xl font-bold">
            {t('auth.academyCreatedTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {planParam ? t('auth.goingToPlans') : t('auth.goingToDashboard')}
          </p>
        </div>
      </div>
    );
  }

  // ─── Step config ──────────────────────────────────────────────────────────

  const steps = [
    { heading: t('auth.step1Heading'), subtitle: t('auth.step1Subtitle') },
    { heading: t('auth.step2Heading'), subtitle: t('auth.step2Subtitle') },
    { heading: t('auth.step3Heading'), subtitle: t('auth.step3Subtitle') },
    { heading: t('auth.step4Heading'), subtitle: t('auth.step4Subtitle') }
  ];

  // ─── Wizard ───────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12"
      dir={'rtl'}
    >
      <div className="w-full max-w-[480px]">
        {/* Top bar */}
        <div className="mb-12 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">mentoma</span>
          <ProgressDots current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step heading */}
        <div className="mb-8">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight">
            {steps[step - 1].heading}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {steps[step - 1].subtitle}
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form className="space-y-4">
            {/* Step 1 — Name */}
            {step === 1 && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="h-14 text-base"
                        placeholder={t('auth.academyNamePlaceholder')}
                        autoFocus
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 2 — URL slug */}
            {step === 2 && (
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex h-14 items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-primary">
                        <div className="flex h-full select-none items-center gap-1.5 whitespace-nowrap border-r bg-muted/50 px-3 text-sm text-muted-foreground">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span>platform.com.</span>
                        </div>
                        <input
                          className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-within:ring-0"
                          placeholder="your-academy"
                          autoFocus
                          {...field}
                          onChange={(e) =>
                            field.onChange(toSlug(e.target.value))
                          }
                          aria-label={t('auth.academyUrl')}
                        />
                      </div>
                    </FormControl>
                    {slug && (
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {`platform.com/${slug}`}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 3 — Description */}
            {step === 3 && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none text-base"
                        placeholder={t('auth.academyDescriptionPlaceholder')}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 4 — Primary color */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(({ hex, label }) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={label}
                      onClick={() => setPrimaryColor(hex)}
                      style={{ '--swatch': hex } as React.CSSProperties}
                      className="relative h-12 w-12 rounded-full bg-[--swatch] transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[--swatch] focus:ring-offset-2"
                    >
                      {primaryColor === hex && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div
                    style={{ '--swatch': primaryColor } as React.CSSProperties}
                    className="h-8 w-8 shrink-0 rounded-full border bg-[--swatch]"
                  />
                  <span className="text-sm text-muted-foreground" dir="ltr">
                    {primaryColor}
                  </span>
                </div>
              </div>
            )}

            {/* CTA row */}
            <div className="space-y-3 pt-2">
              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full"
                  onClick={goNext}
                >
                  {t('auth.continueBtn')}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full"
                  disabled={saving}
                  onClick={submit}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.creatingAcademy')}
                    </>
                  ) : (
                    t('auth.createAcademyBtn')
                  )}
                </Button>
              )}

              <div className="flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('auth.backBtn')}
                  </button>
                ) : (
                  <span />
                )}

                {step === TOTAL_STEPS && (
                  <button
                    type="button"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={submit}
                  >
                    {t('auth.skipForNow')}
                  </button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
