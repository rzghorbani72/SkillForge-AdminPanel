'use client';

import { useEffect, useState } from 'react';
import { Banknote, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

const approveSchema = z.object({
  bank_transaction_code: z.string().min(1, 'validation.required'),
  notes: z.string().optional()
});
const rejectSchema = z.object({ notes: z.string().optional() });
type ApproveValues = z.infer<typeof approveSchema>;
type RejectValues = z.infer<typeof rejectSchema>;

const STATUS_FILTER_LABEL_KEYS: Record<string, string> = {
  ALL: 'withdrawals.statusAll',
  PENDING: 'withdrawals.statusPending',
  APPROVED: 'withdrawals.statusApproved',
  REJECTED: 'withdrawals.statusRejected',
  PAID: 'withdrawals.statusPaid'
};

export default function WithdrawalsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PAID'];

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [approveDialog, setApproveDialog] = useState<any>(null);
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const approveForm = useForm<ApproveValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { bank_transaction_code: '', notes: '' }
  });
  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { notes: '' }
  });

  async function load(status?: string) {
    setLoading(true);
    try {
      const params = status && status !== 'ALL' ? { status } : undefined;
      const data = await apiClient.getWithdrawals(params);
      setWithdrawals(Array.isArray(data) ? data : (data?.withdrawals ?? []));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  async function onApprove(values: ApproveValues) {
    if (!approveDialog) return;
    setSubmitting(true);
    try {
      await apiClient.approveWithdrawal(approveDialog.id, values);
      toast.success(t('common.success'));
      setApproveDialog(null);
      load(statusFilter);
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  async function onReject(values: RejectValues) {
    if (!rejectDialog) return;
    setSubmitting(true);
    try {
      await apiClient.rejectWithdrawal(rejectDialog.id, values);
      toast.success(t('common.success'));
      setRejectDialog(null);
      load(statusFilter);
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('withdrawals.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('withdrawals.description')}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('withdrawals.requests')}</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-full sm:w-36"
              aria-label={t('withdrawals.statusFilter')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(STATUS_FILTER_LABEL_KEYS[s])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Banknote className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('withdrawals.noRequests')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('withdrawals.academy')}</TableHead>
                  <TableHead>{t('withdrawals.amount')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('withdrawals.requestedAt')}</TableHead>
                  <TableHead>{t('withdrawals.bankRef')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.academy?.name ?? '—'}</TableCell>
                    <TableCell>
                      {w.amount != null ? formatNumber(w.amount) : ''}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={w.status?.toLowerCase() ?? 'pending'}
                        label={t(
                          STATUS_FILTER_LABEL_KEYS[w.status ?? 'PENDING']
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {w.requested_at
                        ? new Date(w.requested_at).toLocaleDateString('fa-IR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {w.bank_transaction_code ?? '—'}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {w.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => {
                              approveForm.reset();
                              setApproveDialog(w);
                            }}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            {t('withdrawals.approve')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              rejectForm.reset();
                              setRejectDialog(w);
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            {t('withdrawals.reject')}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!approveDialog}
        onOpenChange={(open) => !open && setApproveDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('withdrawals.approveWithdrawal', {
                academy: approveDialog?.academy?.name ?? '—'
              })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('withdrawals.amount')}:{' '}
            <strong>
              {approveDialog?.amount != null
                ? formatNumber(approveDialog.amount)
                : ''}
            </strong>
          </p>
          <Form {...approveForm}>
            <form
              onSubmit={approveForm.handleSubmit(onApprove)}
              className="space-y-4"
            >
              <FormField
                control={approveForm.control}
                name="bank_transaction_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('withdrawals.bankTransactionCode')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={approveForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('withdrawals.notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setApproveDialog(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('common.saving') : t('withdrawals.approve')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectDialog}
        onOpenChange={(open) => !open && setRejectDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('withdrawals.rejectWithdrawal', {
                academy: rejectDialog?.academy?.name ?? '—'
              })}
            </DialogTitle>
          </DialogHeader>
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(onReject)}
              className="space-y-4"
            >
              <FormField
                control={rejectForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('withdrawals.notes')}</FormLabel>
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
                  onClick={() => setRejectDialog(null)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={submitting}
                >
                  {submitting ? t('common.saving') : t('withdrawals.reject')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
