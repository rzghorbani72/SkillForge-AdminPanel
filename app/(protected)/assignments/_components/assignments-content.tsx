'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/Pagination';
import { PenLine, Search, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  ApiPagination,
  AssignmentSubmission,
  LearningAssignment,
  SubmissionStatus,
} from '@/types/learning-operations';
import { LearningNavGate } from '@/components/access-control/learning-nav-gate';
import { AssignmentsFilters } from './assignments-filters';
import { AssignmentsStats } from './assignments-stats';
import { GradeSubmissionDialog } from '@/components/assignments/grade-submission-dialog';
import { SubmissionStatusBadge } from '@/components/assignments/submission-status-badge';
import type { Dispatch, SetStateAction } from 'react';

export function AssignmentsContent({
  activeTab,
  assignments,
  clearFilters,
  courseFilter,
  fetchStats,
  fetchSubmissions,
  filteredAssignments,
  formatNumber,
  gradedTotal,
  gradingSubmission,
  isLoading,
  isRtl,
  isSubLoading,
  locale,
  pagination,
  pendingTotal,
  reviewQueue,
  search,
  setActiveTab,
  setCourseFilter,
  setCurrentPage,
  setGradingSubmission,
  setSearch,
  setStatusFilter,
  setSubPage,
  statusFilter,
  subPagination,
  submissions,
}: {
  activeTab: 'assignments' | 'submissions';
  assignments: LearningAssignment[];
  clearFilters: () => void;
  courseFilter: string;
  fetchStats: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  filteredAssignments: LearningAssignment[];
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  gradedTotal: number;
  gradingSubmission: AssignmentSubmission | null;
  isLoading: boolean;
  isRtl: boolean;
  isSubLoading: boolean;
  locale: string;
  pagination: ApiPagination | null;
  pendingTotal: number;
  reviewQueue: AssignmentSubmission[];
  search: string;
  setActiveTab: Dispatch<SetStateAction<'assignments' | 'submissions'>>;
  setCourseFilter: Dispatch<SetStateAction<string>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setGradingSubmission: Dispatch<SetStateAction<AssignmentSubmission | null>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setStatusFilter: Dispatch<SetStateAction<SubmissionStatus | 'ALL'>>;
  setSubPage: Dispatch<SetStateAction<number>>;
  statusFilter: SubmissionStatus | 'ALL';
  subPagination: ApiPagination | null;
  submissions: AssignmentSubmission[];
}) {
  const { t } = useTranslation();
  return (
    <LearningNavGate requiredCapability="assignments">
      <div className="flex-1 space-y-6 p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('assignmentsPage.title')}</h1>
          <p className="text-muted-foreground">{t('assignmentsPage.description')}</p>
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
              <CardDescription>{t('assignmentsPage.allAssignmentsDescription')}</CardDescription>
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
              <div className="table-h-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('assignmentsPage.assignment')}</TableHead>
                      <TableHead>{t('assignmentsPage.course')}</TableHead>
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
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                        </TableCell>
                      </TableRow>
                    ) : filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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
                            {a.Lesson?.Course?.title ?? t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{a.Lesson?.title ?? t('assignmentsPage.notAvailable')}</div>
                            {a.Lesson?.Season?.title ? (
                              <div className="text-xs text-muted-foreground">
                                {t('assignmentsPage.season')}: {a.Lesson.Season.title}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {a.due_date
                              ? new Date(a.due_date).toLocaleDateString(locale)
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
                              {a.is_required ? t('common.required') : t('common.optional')}
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
              <div className="table-h-scroll">
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
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          {t('assignmentsPage.noSubmissionsYet')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      reviewQueue.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">
                            {sub.Profile?.display_name ?? t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {sub.Assignment?.Lesson?.Course?.title ??
                              t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {sub.Assignment?.title ?? t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell>
                            <SubmissionStatusBadge status={sub.status} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {sub.score != null && sub.Assignment?.max_score != null
                              ? `${formatNumber(sub.score)} / ${formatNumber(sub.Assignment.max_score)}`
                              : t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {sub.submitted_at
                              ? new Date(sub.submitted_at).toLocaleDateString(locale)
                              : t('assignmentsPage.notAvailable')}
                          </TableCell>
                          <TableCell>
                            {sub.status === 'SUBMITTED' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setGradingSubmission(sub)}
                              >
                                <PenLine className="me-1 h-3 w-3" />
                                {t('assignmentsPage.grade')}
                              </Button>
                            ) : null}
                            {sub.status === 'GRADED' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setGradingSubmission(sub)}
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

        <GradeSubmissionDialog
          submission={gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          onGraded={() => {
            void fetchSubmissions();
            void fetchStats();
          }}
        />
      </div>
    </LearningNavGate>
  );
}
