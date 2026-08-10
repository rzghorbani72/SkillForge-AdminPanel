'use client';

import { useEffect, useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Package,
  BookOpen,
  Tag,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  KeyRound
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { EntityMultiSelect } from '@/components/shared/entity-multi-select';
import { AssignAccessDialog } from '@/components/access/assign-access-dialog';
import { apiClient } from '@/lib/api';
import type { Offer } from '@/types/api';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { useTranslation, useLanguage } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

// ─── Types ────────────────────────────────────────────────────────────────────

type Course = { id: string; title: string; price: number; slug: string };
// A bundle is simply an Offer that unlocks several courses at one price.
type Bundle = Offer & { courses?: Course[] };

// ─── Schema (no academy_id — derived from context) ───────────────────────────

const schema = z.object({
  title: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  price: z.coerce.number().min(0),
  description: z.string().optional()
});
type FormValues = z.infer<typeof schema>;

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

// ─── Course multi-select ─────────────────────────────────────────────────────

function CourseMultiSelect({
  courses,
  selected,
  onChange,
  t,
  formatCurrency
}: {
  courses: Course[];
  selected: string[];
  onChange: (ids: string[]) => void;
  t: (k: string) => string;
  formatCurrency: (n: number) => string;
}) {
  const selectedCourses = courses.filter((c) => selected.includes(c.id));
  const originalTotal = selectedCourses.reduce((s, c) => s + (c.price ?? 0), 0);

  return (
    <div className="space-y-2">
      <EntityMultiSelect
        items={courses.map((c) => ({ id: c.id, title: c.title }))}
        selected={selected}
        onChange={onChange}
        renderMeta={(item) =>
          formatCurrency(courses.find((c) => c.id === item.id)?.price ?? 0)
        }
        labels={{
          placeholder: t('bundles.selectCourses'),
          selected: t('bundles.selectedCourses'),
          search: t('bundles.searchCourses'),
          empty: t('bundles.noCourses'),
          remove: t('bundles.removeCourse')
        }}
      />

      {selectedCourses.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('bundles.originalTotal')}:{' '}
          <span className="font-medium">{formatCurrency(originalTotal)}</span>
        </p>
      )}
    </div>
  );
}

// ─── Bundle card ─────────────────────────────────────────────────────────────

function BundleCard({
  bundle,
  onEdit,
  onToggle,
  onAssign,
  formatCurrency,
  t
}: {
  bundle: Bundle;
  onEdit: () => void;
  onToggle: () => void;
  onAssign: () => void;
  formatCurrency: (n: number) => string;
  t: (k: string) => string;
}) {
  const courses =
    bundle.Courses?.map((bc) => bc.Course) ?? bundle.courses ?? [];

  return (
    <div className="flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{bundle.title}</h3>
            <p className="font-mono text-xs text-muted-foreground">
              {bundle.slug}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={t('accessGrants.title')}
            onClick={onAssign}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <KeyRound className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t('bundles.editBundle')}
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={
              bundle.is_active ? t('bundles.inactive') : t('bundles.active')
            }
            onClick={onToggle}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            {bundle.is_active ? (
              <ToggleRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      {bundle.description && (
        <p className="mx-4 mb-2 line-clamp-2 text-sm text-muted-foreground">
          {bundle.description}
        </p>
      )}

      {/* Included courses */}
      {courses.length > 0 && (
        <div className="mx-4 mb-3 flex flex-wrap gap-1">
          {courses.map((c: any) => (
            <span
              key={c.id}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              <BookOpen className="h-3 w-3" />
              {c.title}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{formatCurrency(bundle.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {courses.length} {t('bundles.courseCount')}
          </span>
          <Badge
            variant={bundle.is_active ? 'default' : 'secondary'}
            className="text-xs"
          >
            {bundle.is_active ? t('bundles.active') : t('bundles.inactive')}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BundlesPage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const formatCurrency = useFormatCurrency();
  const academyId = useCurrentAcademyId();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bundle | null>(null);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', slug: '', price: 0, description: '' }
  });

  const watchedTitle = form.watch('title');

  // Auto-generate slug when title changes (only on create)
  useEffect(() => {
    if (!editTarget) {
      form.setValue('slug', toSlug(watchedTitle), { shouldValidate: false });
    }
  }, [watchedTitle, editTarget]);

  async function loadBundles() {
    setLoadingBundles(true);
    try {
      const data = await apiClient.getAcademyOffers();
      // Single-course offers are managed on the course itself; this page is the
      // bundle view, so it only lists offers that span more than one course.
      setBundles(data.filter((o) => (o.Courses?.length ?? 0) > 1));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoadingBundles(false);
    }
  }

  async function loadCourses() {
    if (!academyId) return;
    setLoadingCourses(true);
    try {
      const data: any = await apiClient.getCourses({ limit: 200 });
      const list = Array.isArray(data)
        ? data
        : (data?.courses ?? data?.data ?? []);
      setCourses(list);
    } catch {
      // non-fatal
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadBundles();
  }, [academyId]);
  useEffect(() => {
    loadCourses();
  }, [academyId]);

  function openCreate() {
    setEditTarget(null);
    setSelectedCourseIds([]);
    form.reset({ title: '', slug: '', price: 0, description: '' });
    setDialogOpen(true);
  }

  function openEdit(bundle: Bundle) {
    setEditTarget(bundle);
    const existing =
      bundle.Courses?.map((bc) => bc.Course.id) ??
      bundle.courses?.map((c) => c.id) ??
      [];
    setSelectedCourseIds(existing);
    form.reset({
      title: bundle.title ?? '',
      slug: bundle.slug ?? '',
      price: bundle.price,
      description: bundle.description ?? ''
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (!academyId) {
      toast.error(t('common.noStoreSelected'));
      return;
    }
    if (selectedCourseIds.length === 0) {
      toast.error(t('bundles.coursesHelp'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        price: values.price,
        course_ids: selectedCourseIds
      };
      if (editTarget) {
        await apiClient.updateOffer(editTarget.id, payload);
      } else {
        await apiClient.createOffer({ ...payload, type: 'ONE_TIME' });
      }
      toast.success(t('common.success'));
      setDialogOpen(false);
      loadBundles();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(bundle: Bundle) {
    try {
      await apiClient.updateOffer(bundle.id, { is_active: !bundle.is_active });
      loadBundles();
    } catch {
      toast.error(t('common.error'));
    }
  }

  const selectedCoursesForHint = useMemo(
    () => courses.filter((c) => selectedCourseIds.includes(c.id)),
    [courses, selectedCourseIds]
  );
  const originalTotal = selectedCoursesForHint.reduce(
    (s, c) => s + (c.price ?? 0),
    0
  );
  const bundlePrice = form.watch('price');
  const savings = originalTotal - bundlePrice;

  return (
    <div className="flex-1 space-y-8 p-6" dir={'rtl'}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('bundles.title')}
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {t('bundles.description')}
          </p>
        </div>
        {academyId && (
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="me-2 h-4 w-4" />
            {t('bundles.newBundle')}
          </Button>
        )}
      </div>

      {/* No academy warning */}
      {!academyId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Select an academy from the header to manage its bundles.
        </div>
      )}

      {/* Loading */}
      {loadingBundles ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('bundles.noBundle')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('bundles.noBundleDesc')}
          </p>
          {academyId && (
            <Button className="mt-6" onClick={openCreate}>
              <Plus className="me-2 h-4 w-4" />
              {t('bundles.newBundle')}
            </Button>
          )}
        </div>
      ) : (
        /* Grid */
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bundles.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              onEdit={() => openEdit(b)}
              onToggle={() => toggleActive(b)}
              onAssign={() => setAssignTarget(b.id)}
              formatCurrency={formatCurrency}
              t={t}
            />
          ))}
        </div>
      )}

      <AssignAccessDialog
        open={assignTarget !== null}
        onOpenChange={(open) => setAssignTarget(open ? assignTarget : null)}
        scope={assignTarget ? { offer_id: assignTarget } : undefined}
      />

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir={'rtl'}>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t('bundles.editBundle') : t('bundles.createBundle')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('bundles.description')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.bundleTitle')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('bundles.titlePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t('bundles.titleHelp')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.slug')}</FormLabel>
                    <FormControl>
                      <Input
                        dir="rtl"
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t('bundles.slugHelp')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.price')}</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t('bundles.priceHelp')}
                    </p>
                    {savings > 0 && (
                      <p className="text-xs font-medium text-emerald-600">
                        {t('bundles.savings')}: {formatCurrency(savings)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course picker */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t('bundles.selectCourses')}
                </label>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading courses…
                  </div>
                ) : (
                  <CourseMultiSelect
                    courses={courses}
                    selected={selectedCourseIds}
                    onChange={setSelectedCourseIds}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {t('bundles.coursesHelp')}
                </p>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder={t('bundles.descriptionPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t('bundles.saveBundle')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
