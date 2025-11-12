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
import { Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
  school: {
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

const STATUS_BADGE_VARIANTS: Record<
  TeacherRequestStatus,
  { variant: 'default' | 'secondary' | 'destructive'; label: string }
> = {
  PENDING: { variant: 'secondary', label: 'Pending' },
  APPROVED: { variant: 'default', label: 'Approved' },
  REJECTED: { variant: 'destructive', label: 'Rejected' }
};

export function TeacherRequestsPageContent() {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | TeacherRequestStatus
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
      toast.error('Failed to load teacher requests');
      setRequests([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus]);

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

  if (isLoading) {
    return <LoadingSpinner message="Loading teacher requests..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Teacher Requests"
        description="Review and manage teacher access requests from students"
      >
        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {requests.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No teacher requests found"
          description={
            selectedStatus !== 'all'
              ? 'Try adjusting the status filter to see more requests.'
              : 'Teacher requests will appear here when students submit them.'
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
                      Requested {submittedAt} • School: {request.school.name}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariant.variant}>
                    {statusVariant.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Reason</p>
                    <p className="text-muted-foreground">{request.reason}</p>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Contact
                      </p>
                      <p>{request.profile.user.email || 'No email provided'}</p>
                      <p>
                        {request.profile.user.phone_number || 'No phone number'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Current Role
                      </p>
                      <p>{request.profile.role?.name}</p>
                    </div>
                    {request.reviewer && (
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">
                          Reviewed By
                        </p>
                        <p>
                          {request.reviewer.user?.name || 'Unknown reviewer'}
                        </p>
                      </div>
                    )}
                  </div>
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
