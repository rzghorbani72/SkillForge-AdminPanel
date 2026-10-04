'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { getLocaleForLanguage } from '@/lib/i18n/config';
import type {
  ApiPagination,
  AssignmentSubmission,
  LearningAssignment,
  SubmissionStatus,
} from '@/types/learning-operations';
import { RequirePermission } from '@/components/access-control/RequirePermission';
import { AssignmentsContent } from './assignments-content';

/** Course ids are cuids, so they are passed through as text, never parsed. */
function parseCourseId(value: string): string | undefined {
  return value.trim() || undefined;
}

export function AssignmentsView({ lockedCourseId }: { lockedCourseId?: string }) {
  const { language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const formatNumber = useNumberFormat();
  const locale = getLocaleForLanguage(language);

  const [assignments, setAssignments] = useState<LearningAssignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [subPagination, setSubPagination] = useState<ApiPagination | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [gradedTotal, setGradedTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [courseFilter, setCourseFilter] = useState(
    lockedCourseId ?? searchParams.get('course_id') ?? '',
  );
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('submissions');

  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);

  const courseId = parseCourseId(courseFilter);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAssignments({
        page: currentPage,
        limit: 15,
        course_id: courseId,
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
        status: statusFilter === 'ALL' ? undefined : statusFilter,
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
          limit: 1,
        }),
        apiClient.getSubmissions({
          status: 'GRADED',
          course_id: courseId,
          limit: 1,
        }),
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

  const filteredAssignments = search
    ? assignments.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    : assignments;

  const reviewQueue = useMemo(
    () =>
      statusFilter === 'ALL'
        ? [...submissions].sort(
            (first, second) =>
              Number(second.status === 'SUBMITTED') - Number(first.status === 'SUBMITTED'),
          )
        : submissions,
    [submissions, statusFilter],
  );

  const clearFilters = () => {
    if (!lockedCourseId) setCourseFilter('');
    setStatusFilter('ALL');
  };

  return (
    <RequirePermission resource="assignments" action="read">
      <AssignmentsContent
        activeTab={activeTab}
        assignments={assignments}
        clearFilters={clearFilters}
        courseFilter={courseFilter}
        courseLocked={Boolean(lockedCourseId)}
        fetchStats={fetchStats}
        fetchSubmissions={fetchSubmissions}
        filteredAssignments={filteredAssignments}
        formatNumber={formatNumber}
        gradedTotal={gradedTotal}
        gradingSubmission={gradingSubmission}
        isLoading={isLoading}
        isRtl={isRtl}
        isSubLoading={isSubLoading}
        locale={locale}
        pagination={pagination}
        pendingTotal={pendingTotal}
        reviewQueue={reviewQueue}
        search={search}
        setActiveTab={setActiveTab}
        setCourseFilter={setCourseFilter}
        setCurrentPage={setCurrentPage}
        setGradingSubmission={setGradingSubmission}
        setSearch={setSearch}
        setStatusFilter={setStatusFilter}
        setSubPage={setSubPage}
        statusFilter={statusFilter}
        subPagination={subPagination}
        submissions={submissions}
      />
    </RequirePermission>
  );
}
