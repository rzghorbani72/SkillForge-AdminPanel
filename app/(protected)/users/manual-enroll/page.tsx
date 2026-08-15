'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  CourseSearchCombobox,
  StudentProfileSearchCombobox
} from '@/components/entity-search';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { CheckCircle, CreditCard, UserPlus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import type { ApiPagination } from '@/types/learning-operations';

interface Enrollment {
  id: string | number;
  status: string;
  enrolled_at: string;
  progress_percent?: number;
  Course?: { id: string | number; title: string };
  Profile?: { id: string | number; display_name: string };
  Payment?: {
    id: string | number;
    amount: number;
    status: string;
    payment_method: string;
  };
}

export default function ManualEnrollPage() {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [courseId, setCourseId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getEnrollments({
        page: currentPage,
        limit: 15
      });
      setEnrollments(data?.enrollments ?? []);
      setPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !profileId) return;
    try {
      setIsEnrolling(true);
      setLastSuccess(null);
      const result = await apiClient.manualEnroll({
        course_id: Number(courseId),
        profile_id: Number(profileId),
        paid_amount: paidAmount ? Number(paidAmount) : undefined,
        payment_note: paymentNote || undefined
      });
      setLastSuccess(
        `${result?.Profile?.display_name ?? profileId} — ${result?.Course?.title ?? courseId}`
      );
      setCourseId('');
      setProfileId('');
      setPaidAmount('');
      setPaymentNote('');
      fetchEnrollments();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return t('students.manualEnroll.paymentMethodBankTransfer');
      case 'ONLINE':
        return t('students.manualEnroll.paymentMethodOnline');
      case 'WALLET':
        return t('students.manualEnroll.paymentMethodWallet');
      default:
        return method;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6" dir={'rtl'}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('students.manualEnroll.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('students.manualEnroll.description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />{' '}
              {t('students.manualEnroll.enrollStudent')}
            </CardTitle>
            <CardDescription>
              {t('students.manualEnroll.enrollStudentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <Label htmlFor="courseId">
                  {t('students.manualEnroll.courseId')}
                </Label>
                <CourseSearchCombobox
                  id="courseId"
                  value={courseId}
                  onValueChange={setCourseId}
                  placeholder={t('entitySearch.searchPlaceholder')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="profileId">
                  {t('students.manualEnroll.studentProfileId')}
                </Label>
                <StudentProfileSearchCombobox
                  id="profileId"
                  value={profileId}
                  onValueChange={setProfileId}
                  placeholder={t('entitySearch.searchPlaceholder')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paidAmount">
                  {t('students.manualEnroll.amountPaid')}
                </Label>
                <NumberInput
                  id="paidAmount"
                  value={paidAmount}
                  onChange={(raw) => setPaidAmount(raw)}
                  placeholder={t('students.manualEnroll.leaveEmptyIfFree')}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('students.manualEnroll.manualPaymentNote')}
                </p>
              </div>
              <div>
                <Label htmlFor="paymentNote">
                  {t('students.manualEnroll.paymentNote')}
                </Label>
                <Input
                  id="paymentNote"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Cash received on 2026-05-01"
                  className="mt-1"
                />
              </div>

              {lastSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {lastSuccess}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isEnrolling || !courseId || !profileId}
              >
                {isEnrolling
                  ? t('students.manualEnroll.enrolling')
                  : t('students.manualEnroll.enrollStudentBtn')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t('students.manualEnroll.recentEnrollments')}
            </CardTitle>
            <CardDescription>
              {t('students.manualEnroll.recentEnrollmentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('students.manualEnroll.student')}</TableHead>
                    <TableHead>{t('students.manualEnroll.course')}</TableHead>
                    <TableHead>{t('students.manualEnroll.payment')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('students.manualEnroll.enrolled')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                      </TableCell>
                    </TableRow>
                  ) : enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        {t('students.manualEnroll.noEnrollmentsFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {e.Profile?.display_name ?? `#${e.Profile?.id}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {e.Course?.title ?? `#${e.Course?.id}`}
                        </TableCell>
                        <TableCell>
                          {e.Payment ? (
                            <div className="flex items-center gap-1 text-xs">
                              <CreditCard className="h-3 w-3" />
                              <span>
                                {formatNumber(e.Payment.amount / 10)}{' '}
                                {t('common.toman')}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getPaymentMethodLabel(
                                  e.Payment.payment_method
                                )}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {t('students.manualEnroll.free')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              e.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : e.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-muted text-muted-foreground'
                            }
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={setCurrentPage}
                itemsPerPage={pagination.limit}
                totalItems={pagination.total}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
