'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { apiErrorMessage } from '@/lib/api-error-message';

const refundSchema = z.object({
  refund_amount: z.coerce.number().optional(),
  reason: z.string().min(1, 'validation.required'),
  revoke_enrollment: z.boolean().default(false),
});
type RefundValues = z.infer<typeof refundSchema>;

export default function RefundsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RefundValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: { reason: '', revoke_enrollment: false },
  });

  async function load() {
    setLoading(true);
    try {
      const data = (await apiClient.getPayments({ limit: 100 })) as any;
      const list = Array.isArray(data) ? data : (data?.payments ?? data?.data ?? []);
      setPayments(list);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openRefundDialog(payment: any) {
    setSelectedPayment(payment);
    try {
      const elig = await apiClient.getRefundEligibility(payment.id);
      setEligibility(elig);
      form.reset({
        refund_amount: elig?.max_refundable ?? payment.amount ?? 0,
        reason: '',
        revoke_enrollment: false,
      });
    } catch {
      setEligibility(null);
      form.reset({
        refund_amount: payment.amount ?? 0,
        reason: '',
        revoke_enrollment: false,
      });
    }
    setDialogOpen(true);
  }

  async function onSubmit(values: RefundValues) {
    if (!selectedPayment) return;
    setSubmitting(true);
    try {
      await apiClient.issueRefund(selectedPayment.id, {
        refund_amount: values.refund_amount,
        reason: values.reason,
        revoke_enrollment: values.revoke_enrollment,
      });
      toast.success(t('common.success'));
      setDialogOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();
    return (
      !term ||
      p.id?.toString().includes(term) ||
      p.status?.toLowerCase().includes(term) ||
      (p.user?.display_name ?? p.Profile?.display_name ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('refunds.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('refunds.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('refunds.payments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('refunds.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RotateCcw className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('refunds.noPayments')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('refunds.student')}</TableHead>
                  <TableHead>{t('refunds.course')}</TableHead>
                  <TableHead>{t('refunds.amount')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('refunds.date')}</TableHead>
                  <TableHead className="text-right">{t('refunds.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.user?.display_name ?? p.Profile?.display_name ?? '—'}</TableCell>
                    <TableCell>{p.course?.title ?? p.Course?.title ?? '—'}</TableCell>
                    <TableCell>{p.amount != null ? formatNumber(p.amount) : ''}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status?.toLowerCase() ?? 'unknown'} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={p.status === 'REFUNDED' || p.status === 'FAILED'}
                        onClick={() => openRefundDialog(p)}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        {t('refunds.issueRefund')}
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
              {t('refunds.refundPayment', {
                student:
                  selectedPayment?.user?.display_name ??
                  selectedPayment?.Profile?.display_name ??
                  t('users.unnamedUser'),
              })}
            </DialogTitle>
          </DialogHeader>
          {eligibility && (
            <div className="space-y-1 rounded-md bg-muted px-4 py-2 text-sm">
              <p>
                {t('refunds.maxRefundable')}:{' '}
                <strong>
                  {eligibility.max_refundable != null
                    ? formatNumber(eligibility.max_refundable)
                    : ''}
                </strong>
              </p>
              {eligibility.reason && <p className="text-muted-foreground">{eligibility.reason}</p>}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="refund_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('refunds.refundAmount')}</FormLabel>
                    <FormControl>
                      <NumberInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value ?? ''}
                        onChange={(raw) => field.onChange(raw === '' ? '' : Number(raw))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('refunds.reason')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revoke_enrollment"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label={t('refunds.revokeEnrollment')}
                        />
                      </FormControl>
                      <Label>{t('refunds.revokeEnrollment')}</Label>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="destructive" disabled={submitting}>
                  {submitting ? t('refunds.processing') : t('refunds.issueRefund')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
