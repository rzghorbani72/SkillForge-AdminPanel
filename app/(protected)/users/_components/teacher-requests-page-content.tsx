'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Users, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

type TeacherRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface TeacherRequest {
  id: number;
  reason: string;
  status: TeacherRequestStatus;
  created_at: string;
  updated_at: string;
  profile: {
    id: number;
    display_name: string;
    role: {
      id: number;
      name: string;
    };
    user: {
      id: number;
      name: string;
      email: string | null;
      phone_number: string | null;
    };
  };
  store: {
    id: number;
    name: string;
    slug: string;
  };
  reviewer?: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function TeacherRequestsPageContent() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | TeacherRequestStatus
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const STATUS_BADGE_VARIANTS: Record<
    TeacherRequestStatus,
    { variant: 'default' | 'secondary' | 'destructive'; label: string }
  > = {
    PENDING: { variant: 'secondary', label: t('teacherRequests.pending') },
    APPROVED: { variant: 'default', label: t('teacherRequests.approved') },
    REJECTED: { variant: 'destructive', label: t('teacherRequests.rejected') }
  };

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: TeacherRequestStatus;
      } = {
        page: currentPage,
        limit: pageSize
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const data = await apiClient.getTeacherRequests(params);

      if (data && typeof data === 'object') {
        setRequests((data as any).requests || []);
        setPagination((data as any).pagination || null);
      } else {
        setRequests([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('Error fetching teacher requests:', error);
      toast.error(t('common.errorLoading'));
      setRequests([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as any);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReviewRequest = async (
    requestId: number,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      await apiClient.reviewTeacherRequest(requestId, { status });
      const statusText =
        status === 'APPROVED'
          ? t('teacherRequests.approved').toLowerCase()
          : t('teacherRequests.rejected').toLowerCase();
      toast.success(t('common.success'));
      fetchRequests();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={t('common.loadingData')} />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={t('teacherRequests.title')}
        description={t('teacherRequests.description')}
      >
        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('teacherRequests.allStatuses')}
              </SelectItem>
              <SelectItem value="PENDING">
                {t('teacherRequests.pending')}
              </SelectItem>
              <SelectItem value="APPROVED">
                {t('teacherRequests.approved')}
              </SelectItem>
              <SelectItem value="REJECTED">
                {t('teacherRequests.rejected')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {requests.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title={t('teacherRequests.noRequestsFound')}
          description={
            selectedStatus !== 'all'
              ? t('common.tryAdjustingFilters')
              : t('teacherRequests.noRequestsFoundDescription')
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => {
            const statusVariant = STATUS_BADGE_VARIANTS[request.status];
            const submittedAt = formatDistanceToNow(
              new Date(request.created_at),
              {
                addSuffix: true
              }
            );

            return (
              <Card key={request.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {request.profile.user.name ||
                        request.profile.display_name}
                    </CardTitle>
                    <CardDescription>
                      {t('common.requested')} {submittedAt} •{' '}
                      {t('common.store')}: {request.store.name}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariant.variant}>
                    {statusVariant.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">{t('common.reason')}</p>
                    <p className="text-muted-foreground">{request.reason}</p>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        {t('common.contact')}
                      </p>
                      <p>{request.profile.user.email || t('common.noData')}</p>
                      <p>
                        {request.profile.user.phone_number ||
                          t('common.noData')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        {t('common.currentRole')}
                      </p>
                      <p>{request.profile.role?.name}</p>
                    </div>
                    {request.reviewer && (
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          {t('common.reviewedBy')}
                        </p>
                        <p>
                          {request.reviewer.user?.name ||
                            t('common.unknownUser') ||
                            'Unknown reviewer'}
                        </p>
                      </div>
                    )}
                  </div>
                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 border-t pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleReviewRequest(request.id, 'APPROVED')
                        }
                        className="flex-1"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {t('teacherRequests.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleReviewRequest(request.id, 'REJECTED')
                        }
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t('teacherRequests.reject')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </div>
  );
}
