'use client';

import { apiErrorMessage } from '@/lib/api-error-message';
import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { AssignAccessDialog } from '@/components/access/assign-access-dialog';
import { apiClient } from '@/lib/api';
import { useCurrentAcademyId } from '@/hooks/useCurrentAcademy';
import { useTranslation } from '@/lib/i18n/hooks';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { Button } from '@/components/ui/button';

import { BundleCard } from './_components/bundle-card';
import { Bundle, Course } from './_components/shared';
import { BundleFormDialog } from './_components/bundle-form-dialog';
import { FormValues, schema } from './_lib/page-helpers';

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BundlesPage() {
  const { t } = useTranslation();
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
    defaultValues: { title: '', slug: '', price: 0, description: '' },
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
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    } finally {
      setLoadingBundles(false);
    }
  }

  async function loadCourses() {
    if (!academyId) return;
    setLoadingCourses(true);
    try {
      const data: any = await apiClient.getCourses({ limit: 200 });
      const list = Array.isArray(data) ? data : (data?.courses ?? data?.data ?? []);
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
      bundle.Courses?.map((bc) => bc.Course.id) ?? bundle.courses?.map((c) => c.id) ?? [];
    setSelectedCourseIds(existing);
    form.reset({
      title: bundle.title ?? '',
      slug: bundle.slug ?? '',
      price: bundle.price,
      description: bundle.description ?? '',
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
        course_ids: selectedCourseIds,
      };
      if (editTarget) {
        await apiClient.updateOffer(editTarget.id, payload);
      } else {
        await apiClient.createOffer({ ...payload, type: 'ONE_TIME' });
      }
      toast.success(t('common.success'));
      setDialogOpen(false);
      loadBundles();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('common.error')));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(bundle: Bundle) {
    try {
      await apiClient.updateOffer(bundle.id, { is_active: !bundle.is_active });
      loadBundles();
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    }
  }

  const selectedCoursesForHint = useMemo(
    () => courses.filter((c) => selectedCourseIds.includes(c.id)),
    [courses, selectedCourseIds],
  );
  const originalTotal = selectedCoursesForHint.reduce((s, c) => s + (c.price ?? 0), 0);
  const bundlePrice = form.watch('price');
  const savings = originalTotal - bundlePrice;

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6" dir={'rtl'}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('bundles.title')}</h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{t('bundles.description')}</p>
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
            <div key={i} className="h-44 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t('bundles.noBundle')}</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t('bundles.noBundleDesc')}</p>
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
      <BundleFormDialog
        courses={courses}
        dialogOpen={dialogOpen}
        editTarget={editTarget}
        form={form}
        formatCurrency={formatCurrency}
        loadingCourses={loadingCourses}
        onSubmit={onSubmit}
        saving={saving}
        savings={savings}
        selectedCourseIds={selectedCourseIds}
        setDialogOpen={setDialogOpen}
        setSelectedCourseIds={setSelectedCourseIds}
      />
    </div>
  );
}
