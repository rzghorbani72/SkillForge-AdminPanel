'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  ChevronLeft
} from 'lucide-react';
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
import Link from 'next/link';

const planSchema = z.object({
  installment_count: z.coerce.number().int().min(1),
  amount_per_installment: z.coerce.number().min(0),
  interval_days: z.coerce.number().int().min(1)
});
type PlanValues = z.infer<typeof planSchema>;

export default function PaymentPlansPage() {
  const { t } = useTranslation();
  const params = useParams<{ course_id: string }>();
  const courseId = parseInt(params.course_id, 10);

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      installment_count: 3,
      amount_per_installment: 0,
      interval_days: 30
    }
  });

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getPaymentPlans(courseId);
      setPlans(Array.isArray(data) ? data : (data?.plans ?? []));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isNaN(courseId)) load();
  }, [courseId]);

  async function onSubmit(values: PlanValues) {
    setSaving(true);
    try {
      await apiClient.createPaymentPlan(courseId, values);
      toast.success(t('common.success'));
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: any) {
    try {
      await apiClient.updatePaymentPlan(plan.id, {
        is_active: !plan.is_active
      });
      load();
    } catch {
      toast.error(t('common.error'));
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('paymentPlans.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('paymentPlans.description', { id: courseId })}
          </p>
        </div>
        <Button
          onClick={() => {
            form.reset();
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('paymentPlans.newPlan')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentPlans.allPlans')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CreditCard className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('paymentPlans.newPlan')}</p>
              <p className="text-sm">{t('paymentPlans.noPlanDesc')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('paymentPlans.installments')}</TableHead>
                  <TableHead>
                    {t('paymentPlans.amountPerInstallment')}
                  </TableHead>
                  <TableHead>{t('paymentPlans.intervalDays')}</TableHead>
                  <TableHead>{t('paymentPlans.total')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.installment_count}x</TableCell>
                    <TableCell>
                      {plan.amount_per_installment?.toLocaleString()}
                    </TableCell>
                    <TableCell>{plan.interval_days}d</TableCell>
                    <TableCell className="font-medium">
                      {(
                        (plan.installment_count ?? 1) *
                        (plan.amount_per_installment ?? 0)
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={plan.is_active ? 'active' : 'inactive'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(plan)}
                      >
                        {plan.is_active ? (
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('paymentPlans.createPlan')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="installment_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentPlans.installments')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount_per_installment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('paymentPlans.amountPerInstallment')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interval_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentPlans.intervalDays')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                  {saving
                    ? t('paymentPlans.creating')
                    : t('paymentPlans.createPlan')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
