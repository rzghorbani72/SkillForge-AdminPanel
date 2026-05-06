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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { CheckCircle, CreditCard, UserPlus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface Enrollment {
  id: number;
  status: string;
  enrolled_at: string;
  progress_percent: number;
  Course?: { id: number; title: string };
  Profile?: { id: number; display_name: string };
  Payment?: {
    id: number;
    amount: number;
    status: string;
    payment_method: string;
  };
}

export default function ManualEnrollPage() {
  const { language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
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
        `Student "${result?.Profile?.display_name ?? profileId}" enrolled in "${result?.Course?.title ?? courseId}"`
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
        return 'Bank Transfer';
      case 'ONLINE':
        return 'Online';
      case 'WALLET':
        return 'Wallet';
      default:
        return method;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Enrollment</h1>
        <p className="text-muted-foreground">
          Enroll students who paid outside the platform (cash, bank transfer, or
          other offline methods)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrollment Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Enroll a Student
            </CardTitle>
            <CardDescription>
              Creates an active enrollment and records a manual payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <Label htmlFor="courseId">Course ID *</Label>
                <Input
                  id="courseId"
                  type="number"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="e.g. 12"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="profileId">Student Profile ID *</Label>
                <Input
                  id="profileId"
                  type="number"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  placeholder="e.g. 55"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paidAmount">Amount Paid (IRR)</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Leave empty if free"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  This creates a MANUAL/BANK_TRANSFER payment record for your
                  records
                </p>
              </div>
              <div>
                <Label htmlFor="paymentNote">Payment Note</Label>
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
                {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>
              All enrollments in your academy (including manual)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900" />
                      </TableCell>
                    </TableRow>
                  ) : enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No enrollments found
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
                                {(e.Payment.amount / 10).toLocaleString()} T
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getPaymentMethodLabel(
                                  e.Payment.payment_method
                                )}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Free
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
                                  : 'bg-gray-100 text-gray-800'
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
