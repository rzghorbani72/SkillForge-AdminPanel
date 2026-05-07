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
        <h1 className="text-3xl font-bold tracking-tight">
          {t('assignmentsPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('assignmentsPage.description')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('assignmentsPage.totalAssignments')}
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
              {t('assignmentsPage.pendingReview')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'SUBMITTED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('assignmentsPage.awaitingGrade')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('assignmentsPage.graded')}
            </CardTitle>
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
          {t('assignmentsPage.assignmentsTab')}
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'submissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('submissions')}
        >
          {t('assignmentsPage.submissionsTab')}
        </button>
      </div>

      {activeTab === 'assignments' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('assignmentsPage.allAssignments')}</CardTitle>
            <CardDescription>
              {t('assignmentsPage.allAssignmentsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('assignmentsPage.searchAssignments')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-8"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('assignmentsPage.assignment')}</TableHead>
                    <TableHead>{t('assignmentsPage.lesson')}</TableHead>
                    <TableHead>{t('assignmentsPage.dueDate')}</TableHead>
                    <TableHead>{t('assignmentsPage.maxScore')}</TableHead>
                    <TableHead>{t('assignmentsPage.submissions')}</TableHead>
                    <TableHead>{t('assignmentsPage.required')}</TableHead>
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
                        {t('assignmentsPage.noAssignmentsFound')}
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
                          {a.Lesson?.title ?? t('assignmentsPage.notAvailable')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.due_date
                            ? new Date(a.due_date).toLocaleDateString()
                            : t('assignmentsPage.notAvailable')}
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
                            {a.is_required
                              ? t('common.required')
                              : t('common.optional')}
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
            <CardTitle>{t('assignmentsPage.studentSubmissions')}</CardTitle>
            <CardDescription>
              {t('assignmentsPage.studentSubmissionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('assignmentsPage.student')}</TableHead>
                    <TableHead>{t('assignmentsPage.assignment')}</TableHead>
                    <TableHead>{t('assignmentsPage.status')}</TableHead>
                    <TableHead>{t('assignmentsPage.score')}</TableHead>
                    <TableHead>{t('assignmentsPage.submitted')}</TableHead>
                    <TableHead>{t('assignmentsPage.action')}</TableHead>
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
                        {t('assignmentsPage.noSubmissionsYet')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.Profile?.display_name ??
                            t('assignmentsPage.notAvailable')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.Assignment?.title ??
                            t('assignmentsPage.notAvailable')}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(sub.status)}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.score != null
                            ? `${sub.score} / ${sub.Assignment?.max_score}`
                            : t('assignmentsPage.notAvailable')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString()
                            : t('assignmentsPage.notAvailable')}
                        </TableCell>
                        <TableCell>
                          {sub.status === 'SUBMITTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openGradeDialog(sub)}
                            >
                              <PenLine className="me-1 h-3 w-3" />{' '}
                              {t('assignmentsPage.grade')}
                            </Button>
                          )}
                          {sub.status === 'GRADED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openGradeDialog(sub)}
                            >
                              {t('assignmentsPage.editGrade')}
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
            <DialogTitle>{t('assignmentsPage.gradeSubmission')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {gradeDialog.submission?.content && (
              <div>
                <Label>{t('assignmentsPage.studentAnswer')}</Label>
                <div className="mt-1 rounded border bg-muted/50 p-3 text-sm">
                  {gradeDialog.submission.content}
                </div>
              </div>
            )}
            {gradeDialog.submission?.file_url && (
              <div>
                <Label>{t('assignmentsPage.attachedFile')}</Label>
                <a
                  href={gradeDialog.submission.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm text-blue-600 underline"
                >
                  {t('assignmentsPage.viewFile')}
                </a>
              </div>
            )}
            <div>
              <Label htmlFor="score">
                {t('assignmentsPage.scoreMax', {
                  max: gradeDialog.submission?.Assignment?.max_score ?? 100
                })}
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
              <Label htmlFor="feedback">
                {t('assignmentsPage.feedbackOptional')}
              </Label>
              <Textarea
                id="feedback"
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder={t('assignmentsPage.feedbackPlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleGrade} disabled={isGrading || !gradeScore}>
              {isGrading ? t('common.saving') : t('assignmentsPage.saveGrade')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
