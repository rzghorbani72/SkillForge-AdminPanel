'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Package, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n/hooks';

const bundleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  academy_id: z.coerce.number().min(1),
  course_ids: z.string().min(1)
});
type BundleFormValues = z.infer<typeof bundleSchema>;

export default function BundlesPage() {
  const { t } = useTranslation();
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<BundleFormValues>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      title: '',
      slug: '',
      price: 0,
      description: '',
      academy_id: 0,
      course_ids: ''
    }
  });

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getBundles();
      setBundles(Array.isArray(data) ? data : (data?.bundles ?? []));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditTarget(null);
    form.reset({
      title: '',
      slug: '',
      price: 0,
      description: '',
      academy_id: 0,
      course_ids: ''
    });
    setDialogOpen(true);
  }

  function openEdit(bundle: any) {
    setEditTarget(bundle);
    form.reset({
      title: bundle.title ?? '',
      slug: bundle.slug ?? '',
      price: bundle.price ?? 0,
      description: bundle.description ?? '',
      academy_id: bundle.academy_id ?? 0,
      course_ids: (
        bundle.course_ids ??
        bundle.courses?.map((c: any) => c.id) ??
        []
      ).join(', ')
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: BundleFormValues) {
    setSaving(true);
    try {
      const courseIds = values.course_ids
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter(Boolean);
      const payload = {
        title: values.title,
        slug: values.slug,
        price: values.price,
        description: values.description,
        academy_id: values.academy_id,
        course_ids: courseIds
      };
      if (editTarget) {
        await apiClient.updateBundle(editTarget.id, payload);
        toast.success(t('common.success'));
      } else {
        await apiClient.createBundle(payload);
        toast.success(t('common.success'));
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(bundle: any) {
    try {
      await apiClient.updateBundle(bundle.id, { is_active: !bundle.is_active });
      load();
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('bundles.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('bundles.description')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('bundles.newBundle')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('bundles.allBundles')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : bundles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('bundles.noBundle')}</p>
              <p className="text-sm">{t('bundles.noBundleDesc')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('bundles.bundleTitle')}</TableHead>
                  <TableHead>{t('bundles.academy')}</TableHead>
                  <TableHead>{t('bundles.price')}</TableHead>
                  <TableHead>{t('bundles.courseCount')}</TableHead>
                  <TableHead>{t('bundles.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell className="font-medium">
                      {bundle.title}
                    </TableCell>
                    <TableCell>
                      {bundle.academy?.name ?? bundle.academy_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      {bundle.price?.toLocaleString() ?? '0'}
                    </TableCell>
                    <TableCell>
                      {bundle.courses?.length ??
                        bundle.course_ids?.length ??
                        '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={bundle.is_active ? 'active' : 'inactive'}
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(bundle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(bundle)}
                      >
                        {bundle.is_active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? t('bundles.editBundle') : t('bundles.createBundle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.bundleTitle')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.slug')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bundles.price')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academy_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bundles.academyId')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="course_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('bundles.courseIds')}</FormLabel>
                    <FormControl>
                      <Input placeholder="1, 2, 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t('common.saving') : t('bundles.saveBundle')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
