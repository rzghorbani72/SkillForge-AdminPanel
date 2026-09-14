'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Award, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DataList, DataPanel, type DataColumn } from '@/components/shared/data-list';
import { StatTile } from '@/components/course/detail/stat-tile';
import { RequirementPill } from '@/components/course/certificates/requirement-pill';
import { useCertificateRoster } from '@/components/course/certificates/use-certificate-roster';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { usePercentLabel } from '@/lib/i18n/use-percent-label';
import type { CertificateRosterStudent } from '@/types/learning-operations';

/**
 * Who has finished, and the one button that says so. The rule is shown next to
 * the roster because a teacher's first question is always "why is this student
 * not eligible" — the tallies answer it without opening each student.
 */
export default function CourseCertificatesPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();
  const percentLabel = usePercentLabel();
  const { course } = useCourseWorkspace();
  const { roster, isLoading, busyEnrollmentId, issue, revoke } = useCertificateRoster(courseId);

  const students = useMemo(() => roster?.students ?? [], [roster]);
  const eligibleCount = students.filter(
    (student) => student.eligibility?.eligible && !student.certificate,
  ).length;
  const issuedCount = students.filter((student) => student.certificate?.is_valid).length;

  if (course && !course.is_certificate) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <Award className="h-8 w-8 text-muted-foreground/40" />
          <p className="max-w-md text-sm text-muted-foreground">
            {t('certificates.courseNotEnabled')}
          </p>
        </div>
      </div>
    );
  }

  const columns: DataColumn<CertificateRosterStudent>[] = [
    {
      id: 'student',
      header: t('students.student'),
      cell: (student) => (
        <span className="font-medium">{student.display_name ?? t('students.unknownStudent')}</span>
      ),
    },
    {
      id: 'lessons',
      header: t('certificates.lessonsWatched'),
      align: 'center',
      cell: (student) =>
        student.eligibility ? (
          <RequirementPill
            label={t('certificates.lessonsWatched')}
            tally={student.eligibility.lessons}
          />
        ) : null,
    },
    {
      id: 'quizzes',
      header: t('certificates.quizzesPassed'),
      align: 'center',
      cell: (student) =>
        student.eligibility ? (
          <RequirementPill
            label={t('certificates.quizzesPassed')}
            tally={student.eligibility.quizzes}
          />
        ) : null,
    },
    {
      id: 'assignments',
      header: t('certificates.assignmentsPassed'),
      align: 'center',
      cell: (student) =>
        student.eligibility ? (
          <RequirementPill
            label={t('certificates.assignmentsPassed')}
            tally={student.eligibility.assignments}
          />
        ) : null,
    },
    {
      id: 'certificate',
      header: t('certificates.certificate'),
      align: 'center',
      cell: (student) =>
        student.certificate?.is_valid ? (
          <div className="text-xs">
            <p className="font-medium text-emerald-600">{student.certificate.certificate_number}</p>
            <p className="text-muted-foreground">{formatDate(student.certificate.issued_at)}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'action',
      header: '',
      align: 'end',
      cell: (student) => {
        const busy = busyEnrollmentId === student.enrollment_id;
        if (student.certificate?.is_valid) {
          return (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void revoke(student.certificate!.id, student.enrollment_id)}
            >
              <ShieldOff className="me-1.5 h-3.5 w-3.5" />
              {t('certificates.revoke')}
            </Button>
          );
        }
        return (
          <Button
            type="button"
            size="sm"
            disabled={busy || !student.eligibility?.eligible}
            onClick={() => void issue(student.enrollment_id)}
          >
            <Award className="me-1.5 h-3.5 w-3.5" />
            {busy ? t('common.saving') : t('certificates.issue')}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile
          icon={<Award className="h-4 w-4" />}
          label={t('certificates.issuedCount')}
          value={isLoading ? null : formatNumber(issuedCount)}
          sub={t('certificates.issuedCountHint')}
          color="emerald"
        />
        <StatTile
          icon={<Award className="h-4 w-4" />}
          label={t('certificates.readyCount')}
          value={isLoading ? null : formatNumber(eligibleCount)}
          sub={t('certificates.readyCountHint')}
          color="blue"
        />
        <StatTile
          icon={<Award className="h-4 w-4" />}
          label={t('certificates.passMark')}
          value={roster ? percentLabel(roster.course.certificate_min_percent) : null}
          sub={t('certificates.passMarkHint')}
          color="amber"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <DataPanel title={t('certificates.rosterTitle')} subtitle={t('certificates.rosterHint')}>
          <DataList
            items={students}
            columns={columns}
            rowKey={(student) => student.enrollment_id}
            emptyState={
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                {t('courseDetail.noEnrollments')}
              </p>
            }
          />
        </DataPanel>
      )}
    </div>
  );
}
