'use client';

import { useEffect, useState } from 'react';
import { Plus, Network, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useTranslation } from '@/lib/i18n/hooks';

const affiliateSchema = z.object({
  code: z.string().optional(),
  profile_id: z.coerce.number().min(1),
  course_id: z.coerce.number().optional(),
  academy_id: z.coerce.number().min(1),
  commission_rate: z.coerce.number().min(0).max(1)
});
type AffiliateValues = z.infer<typeof affiliateSchema>;

export default function AffiliatesPage() {
  const { t } = useTranslation();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<AffiliateValues>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: {
      code: '',
      profile_id: 0,
      course_id: undefined,
      academy_id: 0,
      commission_rate: 0.1
    }
  });

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getAffiliates();
      setAffiliates(Array.isArray(data) ? data : (data?.affiliates ?? []));
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
      code: '',
      profile_id: 0,
      course_id: undefined,
      academy_id: 0,
      commission_rate: 0.1
    });
    setDialogOpen(true);
  }

  function openEdit(aff: any) {
    setEditTarget(aff);
    form.reset({
      code: aff.code ?? '',
      profile_id: aff.profile_id ?? 0,
      course_id: aff.course_id ?? undefined,
      academy_id: aff.academy_id ?? 0,
      commission_rate: aff.commission_rate ?? 0.1
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: AffiliateValues) {
    setSaving(true);
    try {
      if (editTarget) {
        await apiClient.updateAffiliate(editTarget.id, {
          commission_rate: values.commission_rate
        });
      } else {
        await apiClient.createAffiliate({
          code: values.code || undefined,
          profile_id: values.profile_id,
          course_id: values.course_id || undefined,
          academy_id: values.academy_id,
          commission_rate: values.commission_rate
        });
      }
      toast.success(t('common.success'));
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(aff: any) {
    try {
      await apiClient.updateAffiliate(aff.id, { is_active: !aff.is_active });
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
            {t('affiliates.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('affiliates.description')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('affiliates.newAffiliate')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('affiliates.allAffiliates')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : affiliates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Network className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('affiliates.noAffiliates')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('affiliates.code')}</TableHead>
                  <TableHead>{t('affiliates.profile')}</TableHead>
                  <TableHead>{t('affiliates.academy')}</TableHead>
                  <TableHead>{t('affiliates.course')}</TableHead>
                  <TableHead>{t('affiliates.commission')}</TableHead>
                  <TableHead>{t('affiliates.stats')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((aff) => (
                  <TableRow key={aff.id}>
                    <TableCell className="font-mono text-sm">
                      {aff.code ?? '—'}
                    </TableCell>
                    <TableCell>
                      {aff.profile?.display_name ?? aff.profile_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      {aff.academy?.name ?? aff.academy_id ?? '—'}
                    </TableCell>
                    <TableCell>
                      {aff.course?.title ??
                        aff.course_id ??
                        t('affiliates.allCourses')}
                    </TableCell>
                    <TableCell>
                      {((aff.commission_rate ?? 0) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {aff.clicks ?? 0} {t('affiliates.clicks')} ·{' '}
                      {aff.conversions ?? 0} {t('affiliates.conversions')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={aff.is_active ? 'active' : 'inactive'}
                      />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(aff)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(aff)}
                      >
                        {aff.is_active ? (
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? t('affiliates.editAffiliate')
                : t('affiliates.createAffiliate')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!editTarget && (
                <>
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('affiliates.code')} — {t('affiliates.codeHint')}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profile_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('affiliates.profileId')}</FormLabel>
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
                          <FormLabel>{t('affiliates.academyId')}</FormLabel>
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
                    name="course_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('affiliates.courseId')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliates.commissionRate')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                  {saving ? t('common.saving') : t('affiliates.saveAffiliate')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
