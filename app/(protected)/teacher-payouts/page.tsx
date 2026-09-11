'use client';

import { useEffect, useState } from 'react';
import { Wallet, Check, X } from 'lucide-react';
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
import { apiErrorMessage } from '@/lib/api-error-message';

const rejectSchema = z.object({ notes: z.string().optional() });
type RejectValues = z.infer<typeof rejectSchema>;

export default function TeacherPayoutsPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rejectDialog, setRejectDialog] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const rejectForm = useForm<RejectValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { notes: '' }
  });

  async function load(status?: string) {
    setLoading(true);
    try {
      const params = status && status !== 'ALL' ? { status } : undefined;
      const data = await apiClient.getTeacherPayouts(params);
      setPayouts(Array.isArray(data) ? data : (data?.requests ?? []));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('common.error')));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  async function approve(id: number) {
    try {
      await apiClient.approveTeacherPayout(id);
      toast.success(t('common.success'));
      load(statusFilter);
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    }
  }

  async function onReject(values: RejectValues) {
    if (!rejectDialog) return;
    setSubmitting(true);
    try {
      await apiClient.rejectTeacherPayout(rejectDialog.id, values.notes);
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
          {t('teacherPayouts.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('teacherPayouts.description')}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('teacherPayouts.requests')}</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-36"
              aria-label={t('teacherPayouts.statusFilter')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
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
          ) : payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="mb-3 h-10 w-10" />
              <p className="font-medium">{t('teacherPayouts.noRequests')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('teacherPayouts.teacher')}</TableHead>
                  <TableHead>{t('teacherPayouts.academy')}</TableHead>
                  <TableHead>{t('teacherPayouts.amount')}</TableHead>
                  <TableHead>{t('teacherPayouts.bankInfo')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('teacherPayouts.requestedAt')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.profile?.display_name ?? p.teacher?.name ?? '—'}
                    </TableCell>
                    <TableCell>{p.academy?.name ?? '—'}</TableCell>
                    <TableCell>
                      {p.amount != null ? formatNumber(p.amount) : ''}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs">
                      {p.bank_info ?? '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={p.status?.toLowerCase() ?? 'pending'}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.requested_at
                        ? new Date(p.requested_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      {p.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600"
                            onClick={() => approve(p.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            {t('teacherPayouts.approve')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              rejectForm.reset();
                              setRejectDialog(p);
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            {t('teacherPayouts.reject')}
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
        open={!!rejectDialog}
        onOpenChange={(open) => !open && setRejectDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('teacherPayouts.rejectPayout', {
                teacher:
                  rejectDialog?.profile?.display_name ??
                  rejectDialog?.teacher?.name ??
                  t('users.unnamedUser')
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
                    <FormLabel>{t('teacherPayouts.notes')}</FormLabel>
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
                  {submitting ? t('common.saving') : t('teacherPayouts.reject')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
