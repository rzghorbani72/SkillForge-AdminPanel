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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PenLine,
  Search,
  Star
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  max_score: number;
  is_required: boolean;
  Lesson?: {
    id: number;
    title: string;
    Season?: { id: number; title: string; course_id: number };
  };
  _count?: { Submission: number };
}

interface Submission {
  id: number;
  status: string;
  score?: number;
  feedback?: string;
  submitted_at?: string;
  graded_at?: string;
  content?: string;
  file_url?: string;
  Assignment?: { id: number; title: string; max_score: number };
  Profile?: { id: number; display_name: string };
  GradedBy?: { id: number; display_name: string };
}

export default function AssignmentsPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [subPagination, setSubPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>(
    'assignments'
  );

  // Grade dialog
  const [gradeDialog, setGradeDialog] = useState<{
    open: boolean;
    submission: Submission | null;
  }>({ open: false, submission: null });
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAssignments({
        page: currentPage,
        limit: 15
      });
      setAssignments(data?.assignments ?? []);
      setPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsSubLoading(true);
      const data = await apiClient.getSubmissions({ page: subPage, limit: 15 });
      setSubmissions(data?.submissions ?? []);
      setSubPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSubLoading(false);
    }
  }, [subPage]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);
  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, fetchSubmissions]);

  const handleGrade = async () => {
    if (!gradeDialog.submission) return;
    try {
      setIsGrading(true);
      await apiClient.gradeSubmission(gradeDialog.submission.id, {
        score: Number(gradeScore),
        feedback: gradeFeedback || undefined
      });
      setGradeDialog({ open: false, submission: null });
      fetchSubmissions();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsGrading(false);
    }
  };

  const openGradeDialog = (sub: Submission) => {
    setGradeDialog({ open: true, submission: sub });
    setGradeScore(sub.score != null ? String(sub.score) : '');
    setGradeFeedback(sub.feedback ?? '');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = search
    ? assignments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      )
    : assignments;

  return (
    <div className="flex-1 space-y-6 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">
          Manage course assignments and grade student submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagination?.total ?? assignments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'SUBMITTED').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'GRADED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'submissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </button>
      </div>

      {activeTab === 'assignments' && (
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>
              Assignments created for lessons across your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-8"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900" />
                      </TableCell>
                    </TableRow>
                  ) : filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="font-medium">{a.title}</div>
                          {a.description && (
                            <div className="line-clamp-1 text-xs text-muted-foreground">
                              {a.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.Lesson?.title ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.due_date
                            ? new Date(a.due_date).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Star className="me-1 h-3 w-3" />
                            {a.max_score}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {a._count?.Submission ?? 0}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              a.is_required
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {a.is_required ? 'Required' : 'Optional'}
                          </Badge>
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
      )}

      {activeTab === 'submissions' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
              Review and grade student assignment submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSubLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900" />
                      </TableCell>
                    </TableRow>
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No submissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.Profile?.display_name ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.Assignment?.title ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(sub.status)}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.score != null
                            ? `${sub.score} / ${sub.Assignment?.max_score}`
                            : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'SUBMITTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGradeDialog(sub)}
                            >
                              <PenLine className="me-1 h-3 w-3" /> Grade
                            </Button>
                          )}
                          {sub.status === 'GRADED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openGradeDialog(sub)}
                            >
                              Edit Grade
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {subPagination && subPagination.totalPages > 1 && (
              <Pagination
                currentPage={subPagination.page}
                totalPages={subPagination.totalPages}
                hasNextPage={subPagination.hasNextPage}
                hasPreviousPage={subPagination.hasPreviousPage}
                onPageChange={setSubPage}
                itemsPerPage={subPagination.limit}
                totalItems={subPagination.total}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Grade Dialog */}
      <Dialog
        open={gradeDialog.open}
        onOpenChange={(open) => setGradeDialog((d) => ({ ...d, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {gradeDialog.submission?.content && (
              <div>
                <Label>Student Answer</Label>
                <div className="mt-1 rounded border bg-muted/50 p-3 text-sm">
                  {gradeDialog.submission.content}
                </div>
              </div>
            )}
            {gradeDialog.submission?.file_url && (
              <div>
                <Label>Attached File</Label>
                <a
                  href={gradeDialog.submission.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm text-blue-600 underline"
                >
                  View file
                </a>
              </div>
            )}
            <div>
              <Label htmlFor="score">
                Score (max:{' '}
                {gradeDialog.submission?.Assignment?.max_score ?? 100})
              </Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={gradeDialog.submission?.Assignment?.max_score ?? 100}
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Textarea
                id="feedback"
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Provide feedback to the student..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeDialog({ open: false, submission: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleGrade} disabled={isGrading || !gradeScore}>
              {isGrading ? 'Saving...' : 'Save Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
