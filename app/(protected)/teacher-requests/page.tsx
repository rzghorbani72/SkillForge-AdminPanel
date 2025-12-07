'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  GraduationCap,
  Building
} from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';

interface TeacherRequest {
  id: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at?: string;
  profile: {
    id: number;
    display_name: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone_number: string;
    };
    role: {
      name: string;
    };
  };
  store: {
    id: number;
    name: string;
    slug: string;
  };
  reviewer?: {
    user: {
      name: string;
    };
  };
}

export default function TeacherRequestsPage() {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(
    null
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED'
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchTeacherRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTeacherRequests({
        page: pagination.page,
        limit: pagination.limit
      });

      if (data && typeof data === 'object') {
        const requestList = (data as any).requests ?? [];
        const paginationInfo = (data as any).pagination ?? null;

        setRequests(requestList);

        if (paginationInfo) {
          setPagination((prev) => ({
            ...prev,
            total: paginationInfo.total ?? prev.total,
            totalPages: paginationInfo.totalPages ?? prev.totalPages,
            hasNextPage: Boolean(paginationInfo.hasNextPage),
            hasPreviousPage: Boolean(paginationInfo.hasPreviousPage)
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }));
        }
      } else {
        setRequests([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }));
      }
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page]);

  useEffect(() => {
    fetchTeacherRequests();
  }, [fetchTeacherRequests]);

  const handleReview = async () => {
    if (!selectedRequest) return;

    try {
      setReviewing(true);
      await apiClient.reviewTeacherRequest(selectedRequest.id, {
        status: reviewStatus,
        notes: reviewNotes || undefined
      });

      ErrorHandler.showSuccess(
        `Teacher request ${reviewStatus.toLowerCase()} successfully`
      );
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewStatus('APPROVED');
      setReviewNotes('');
      fetchTeacherRequests();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {t('teacherRequests.pending')}
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {t('teacherRequests.approved')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> {t('teacherRequests.rejected')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('teacherRequests.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('teacherRequests.description')}
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {t('teacherRequests.noRequests')}
            </h3>
            <p className="text-center text-muted-foreground">
              {t('teacherRequests.noRequestsDescription')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('teacherRequests.title')}</CardTitle>
            <CardDescription>
              {t('teacherRequests.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.students')}</TableHead>
                  <TableHead>{t('common.store')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('common.reviewedBy')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {request.profile.user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.profile.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{request.store.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.reviewer ? (
                        <span className="text-sm text-muted-foreground">
                          {request.reviewer.user.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewDialogOpen(true);
                          }}
                          disabled={request.status !== 'PENDING'}
                        >
                          <Eye className="me-1 h-4 w-4" />
                          {t('common.review')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t('common.showingResults', {
                    from: (pagination.page - 1) * pagination.limit + 1,
                    to: Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    ),
                    total: pagination.total
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1
                      }))
                    }
                    disabled={!pagination.hasPreviousPage}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1
                      }))
                    }
                    disabled={!pagination.hasNextPage}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('common.review')} {t('teacherRequests.title')}
            </DialogTitle>
            <DialogDescription>
              {t('teacherRequests.description')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    {t('common.name')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {t('common.email')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {t('common.phone')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.phone_number}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {t('common.store')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.store.name}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {t('common.reason')}
                </Label>
                <div className="mt-1 rounded-md bg-muted p-3">
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="review-status" className="text-sm font-medium">
                  {t('common.decision')}
                </Label>
                <Select
                  value={reviewStatus}
                  onValueChange={(value: 'APPROVED' | 'REJECTED') =>
                    setReviewStatus(value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">
                      {t('teacherRequests.approve')}
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      {t('teacherRequests.reject')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="review-notes" className="text-sm font-medium">
                  {t('common.notes')} ({t('common.optional')})
                </Label>
                <Textarea
                  id="review-notes"
                  placeholder={t('common.addNotes')}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewing}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleReview} disabled={reviewing}>
              {reviewing ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.review')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
