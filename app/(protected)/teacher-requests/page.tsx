'use client';

import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  User,
  GraduationCap,
  Building
} from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import { authService } from '@/lib/auth';

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
  school: {
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

  useEffect(() => {
    fetchTeacherRequests();
  }, [pagination.page]);

  const fetchTeacherRequests = async () => {
    try {
      setLoading(true);
      // Auth type is handled by the new auth service

      const response = await fetch(
        `/api/teacher-requests?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch teacher requests');
      }

      const data = await response.json();
      setRequests(data.data.requests);
      setPagination((prev) => ({
        ...prev,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
        hasNextPage: data.data.pagination.hasNextPage,
        hasPreviousPage: data.data.pagination.hasPreviousPage
      }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    try {
      setReviewing(true);
      // Auth type is handled by the new auth service

      const response = await fetch(
        `/api/teacher-requests/${selectedRequest.id}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: reviewStatus,
            notes: reviewNotes
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to review teacher request');
      }

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
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Teacher Requests
          </h1>
          <p className="text-muted-foreground">
            Review and manage teacher role requests from students
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Teacher Requests</h3>
            <p className="text-center text-muted-foreground">
              There are no pending teacher requests at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Requests</CardTitle>
            <CardDescription>
              Review requests from students who want to become teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Actions</TableHead>
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
                        <span>{request.school.name}</span>
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
                          <Eye className="mr-1 h-4 w-4" />
                          Review
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
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{' '}
                  of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
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
                    Previous
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
                    Next
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
            <DialogTitle>Review Teacher Request</DialogTitle>
            <DialogDescription>
              Review the teacher request and decide whether to approve or reject
              it.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.profile.user.phone_number}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">School</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.school.name}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Request Reason</Label>
                <div className="mt-1 rounded-md bg-muted p-3">
                  <p className="text-sm">{selectedRequest.reason}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="review-status" className="text-sm font-medium">
                  Decision
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
                    <SelectItem value="APPROVED">Approve</SelectItem>
                    <SelectItem value="REJECTED">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="review-notes" className="text-sm font-medium">
                  Review Notes (Optional)
                </Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add any notes about your decision..."
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
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={reviewing}>
              {reviewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reviewing...
                </>
              ) : (
                `Review Request`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
