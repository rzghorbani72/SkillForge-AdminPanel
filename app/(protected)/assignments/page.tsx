'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { PenLine, Search, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import type {
  ApiPagination,
  AssignmentSubmission,
  LearningAssignment,
  SubmissionStatus
} from '@/types/learning-operations';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { RequirePermission } from '@/components/access-control/RequirePermission';
import { AssignmentsFilters } from './_components/assignments-filters';
import { AssignmentsStats } from './_components/assignments-stats';

function parseCourseId(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function AssignmentsPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const formatNumber = useNumberFormat();
  const locale = getLocaleForLanguage(language);

  const [assignments, setAssignments] = useState<LearningAssignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [subPagination, setSubPagination] = useState<ApiPagination | null>(
    null
  );
  const [pendingTotal, setPendingTotal] = useState(0);
  const [gradedTotal, setGradedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>(
    'ALL'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>(
    'submissions'
  );

  const [gradeDialog, setGradeDialog] = useState<{
    open: boolean;
    submission: AssignmentSubmission | null;
  }>({ open: false, submission: null });
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const courseId = parseCourseId(courseFilter);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAssignments({
        page: currentPage,
        limit: 15,
        course_id: courseId
      });
      setAssignments(data?.assignments ?? []);
      setPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, courseId]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsSubLoading(true);
      const data = await apiClient.getSubmissions({
        page: subPage,
        limit: 15,
        course_id: courseId,
        status: statusFilter === 'ALL' ? undefined : statusFilter
      });
      setSubmissions(data?.submissions ?? []);
      setSubPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSubLoading(false);
    }
  }, [subPage, courseId, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const [pending, graded] = await Promise.all([
        apiClient.getSubmissions({
          status: 'SUBMITTED',
          course_id: courseId,
          limit: 1
        }),
        apiClient.getSubmissions({
          status: 'GRADED',
          course_id: courseId,
          limit: 1
        })
      ]);
      setPendingTotal(pending.pagination?.total ?? 0);
      setGradedTotal(graded.pagination?.total ?? 0);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
    setSubPage(1);
  }, [courseFilter, statusFilter]);

  const handleGrade = async () => {
    if (!gradeDialog.submission) return;
    const score = Number(gradeScore);
    const maxScore = gradeDialog.submission.Assignment?.max_score;
    if (
      !Number.isFinite(score) ||
      score < 0 ||
      maxScore === undefined ||
      score > maxScore
    ) {
      return;
    }
    try {
      setIsGrading(true);
      await apiClient.gradeSubmission(gradeDialog.submission.id, {
        score,
        feedback: gradeFeedback || undefined
      });
      setGradeDialog({ open: false, submission: null });
      void fetchSubmissions();
      void fetchStats();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsGrading(false);
    }
  };

  const openGradeDialog = (sub: AssignmentSubmission) => {
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
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAssignments = search
    ? assignments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      )
    : assignments;

  const reviewQueue = useMemo(
    () =>
      statusFilter === 'ALL'
        ? [...submissions].sort(
            (first, second) =>
              Number(second.status === 'SUBMITTED') -
              Number(first.status === 'SUBMITTED')
          )
        : submissions,
    [submissions, statusFilter]
  );

  const clearFilters = () => {
    setCourseFilter('');
    setStatusFilter('ALL');
  };

  return (
    <RequirePermission resource="assignments" action="read">
      <LearningNavGate requiredCapability="assignments">
        <div
          className="flex-1 space-y-6 p-4 sm:p-6"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('assignmentsPage.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('assignmentsPage.description')}
            </p>
          </div>

          <AssignmentsStats
            totalAssignments={pagination?.total ?? assignments.length}
            pendingReview={pendingTotal}
            gradedCount={gradedTotal}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('assignmentsPage.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentsFilters
                courseId={courseFilter}
                onCourseIdChange={setCourseFilter}
                status={statusFilter}
                onStatusChange={setStatusFilter}
                showStatusFilter={activeTab === 'submissions'}
                onClear={clearFilters}
              />
            </CardContent>
          </Card>

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
                        <TableHead>{t('assignmentsPage.course')}</TableHead>
                        <TableHead>{t('assignmentsPage.lesson')}</TableHead>
                        <TableHead>{t('assignmentsPage.dueDate')}</TableHead>
                        <TableHead>{t('assignmentsPage.maxScore')}</TableHead>
                        <TableHead>
                          {t('assignmentsPage.submissions')}
                        </TableHead>
                        <TableHead>{t('assignmentsPage.required')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                          </TableCell>
                        </TableRow>
                      ) : filteredAssignments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
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
                              {a.description ? (
                                <div className="line-clamp-1 text-xs text-muted-foreground">
                                  {a.description}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm">
                              {a.Lesson?.Course?.title ??
                                t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                {a.Lesson?.title ??
                                  t('assignmentsPage.notAvailable')}
                              </div>
                              {a.Lesson?.Season?.title ? (
                                <div className="text-xs text-muted-foreground">
                                  {t('assignmentsPage.season')}:{' '}
                                  {a.Lesson.Season.title}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {a.due_date
                                ? new Date(a.due_date).toLocaleDateString(
                                    locale
                                  )
                                : t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                <Star className="me-1 h-3 w-3" />
                                {formatNumber(a.max_score)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatNumber(a._count?.Submission ?? 0)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  a.is_required
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-muted text-muted-foreground'
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
                {pagination && pagination.totalPages > 1 ? (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNextPage={pagination.hasNextPage}
                    hasPreviousPage={pagination.hasPreviousPage}
                    onPageChange={setCurrentPage}
                    itemsPerPage={pagination.limit}
                    totalItems={pagination.total}
                  />
                ) : null}
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
                        <TableHead>{t('assignmentsPage.course')}</TableHead>
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
                          <TableCell colSpan={7} className="h-32 text-center">
                            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                          </TableCell>
                        </TableRow>
                      ) : submissions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-32 text-center text-muted-foreground"
                          >
                            {t('assignmentsPage.noSubmissionsYet')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviewQueue.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell className="font-medium">
                              {sub.Profile?.display_name ??
                                t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell className="text-sm">
                              {sub.Assignment?.Lesson?.Course?.title ??
                                t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell className="text-sm">
                              {sub.Assignment?.title ??
                                t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColor(sub.status)}>
                                {t(`learningOperations.status.${sub.status}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sub.score != null &&
                              sub.Assignment?.max_score != null
                                ? `${formatNumber(sub.score)} / ${formatNumber(sub.Assignment.max_score)}`
                                : t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {sub.submitted_at
                                ? new Date(sub.submitted_at).toLocaleDateString(
                                    locale
                                  )
                                : t('assignmentsPage.notAvailable')}
                            </TableCell>
                            <TableCell>
                              {sub.status === 'SUBMITTED' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openGradeDialog(sub)}
                                >
                                  <PenLine className="me-1 h-3 w-3" />
                                  {t('assignmentsPage.grade')}
                                </Button>
                              ) : null}
                              {sub.status === 'GRADED' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openGradeDialog(sub)}
                                >
                                  {t('assignmentsPage.editGrade')}
                                </Button>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {subPagination && subPagination.totalPages > 1 ? (
                  <Pagination
                    currentPage={subPagination.page}
                    totalPages={subPagination.totalPages}
                    hasNextPage={subPagination.hasNextPage}
                    hasPreviousPage={subPagination.hasPreviousPage}
                    onPageChange={setSubPage}
                    itemsPerPage={subPagination.limit}
                    totalItems={subPagination.total}
                  />
                ) : null}
              </CardContent>
            </Card>
          )}

          <Dialog
            open={gradeDialog.open}
            onOpenChange={(open) => setGradeDialog((d) => ({ ...d, open }))}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('assignmentsPage.gradeSubmission')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {gradeDialog.submission?.content ? (
                  <div>
                    <Label>{t('assignmentsPage.studentAnswer')}</Label>
                    <div className="mt-1 rounded border bg-muted/50 p-3 text-sm">
                      {gradeDialog.submission.content}
                    </div>
                  </div>
                ) : null}
                {gradeDialog.submission?.file_url ? (
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
                ) : null}
                {gradeDialog.submission ? (
                  <div className="rounded-lg border p-3">
                    <DiscussionThread
                      submissionId={String(gradeDialog.submission.id)}
                      threadId={gradeDialog.submission.discussion_thread_id}
                    />
                  </div>
                ) : null}
                <div>
                  <Label htmlFor="score">
                    {t('assignmentsPage.scoreMax', {
                      max:
                        gradeDialog.submission?.Assignment?.max_score != null
                          ? formatNumber(
                              gradeDialog.submission.Assignment.max_score
                            )
                          : t('assignmentsPage.notAvailable')
                    })}
                  </Label>
                  <NumberInput
                    id="score"
                    value={gradeScore}
                    onChange={(raw) => setGradeScore(raw)}
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
                  onClick={() =>
                    setGradeDialog({ open: false, submission: null })
                  }
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleGrade}
                  disabled={
                    isGrading ||
                    !gradeScore ||
                    gradeDialog.submission?.Assignment?.max_score === undefined
                  }
                >
                  {isGrading
                    ? t('common.saving')
                    : t('assignmentsPage.saveGrade')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </LearningNavGate>
    </RequirePermission>
  );
}
