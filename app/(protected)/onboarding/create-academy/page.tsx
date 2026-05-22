'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sparkles,
  Building2,
  Loader2,
  Globe,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { toast } from 'react-toastify';
import { useStore } from '@/hooks/useStore';
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

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

// ─── Page ─────────────────────────────────────────────────────────────────

const NEXT_STEPS_KEYS = [
  'auth.onboardingStep1',
  'auth.onboardingStep2',
  'auth.onboardingStep3',
  'auth.onboardingStep4'
] as const;

export default function CreateAcademyPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const { refreshAcademies } = useStore();
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const form = useForm<AcademyValues>({
    resolver: zodResolver(useAcademySchema(t)),
    defaultValues: { name: '', slug: '', description: '' }
  });

  const slug = form.watch('slug');

  function handleNameChange(name: string) {
    form.setValue('name', name);
    const currentSlug = form.getValues('slug');
    const prev = toSlug(form.getValues('name').slice(0, name.length - 1) || '');
    if (!currentSlug || currentSlug === prev) {
      form.setValue('slug', toSlug(name), { shouldValidate: false });
    }
  }

  async function onSubmit(values: AcademyValues) {
    setSaving(true);
    try {
      await apiClient.createAcademy({
        name: values.name,
        private_domain: values.slug,
        description: values.description || undefined
      });
      await refreshAcademies();
      setCreated(true);
      toast.success(t('auth.academyCreatedTitle'));
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
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
            {t('auth.goingToDashboard')}
          </p>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-lg">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('auth.setupAcademyTitle')}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {t('auth.setupAcademySubtitle')}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Academy name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t('auth.academyName')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2
                          className={cn(
                            'absolute top-2.5 h-5 w-5 text-muted-foreground',
                            isRTL ? 'right-3' : 'left-3'
                          )}
                        />
                        <Input
                          className={cn('text-base', isRTL ? 'pr-10' : 'pl-10')}
                          placeholder={t('auth.academyNamePlaceholder')}
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URL slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t('auth.academyUrl')}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center overflow-hidden rounded-md border bg-muted/20 focus-within:ring-1 focus-within:ring-primary">
                        <div className="flex select-none items-center gap-1.5 whitespace-nowrap border-r bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span>skillforge.com/</span>
                        </div>
                        <input
                          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                          placeholder="your-academy"
                          dir="ltr"
                          {...field}
                          onChange={(e) =>
                            field.onChange(toSlug(e.target.value))
                          }
                          aria-label={t('auth.academyUrl')}
                        />
                      </div>
                    </FormControl>
                    {slug && (
                      <FormDescription>
                        {t('auth.academyUrlDesc').replace(
                          '{url}',
                          `skillforge.com/${slug}`
                        )}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      {t('auth.academyDescriptionLabel')}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({t('common.optional')})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={t('auth.academyDescriptionPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('auth.creatingAcademy')}
                  </>
                ) : (
                  <>
                    {t('auth.createAcademyBtn')}{' '}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* What's next */}
        <div className="mt-8 rounded-xl border bg-muted/30 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('auth.whatHappensNext')}
          </p>
          <ul className="space-y-2.5">
            {NEXT_STEPS_KEYS.map((key, i) => (
              <li
                key={key}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/80 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
