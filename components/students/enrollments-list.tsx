'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataList, type DataColumn } from '@/components/shared/data-list';
import { UserAvatar } from '@/components/users/user-avatar';
import { toneFromId } from '@/components/users/user-card';
import { Progress } from '@/components/ui/progress';
import { useNumberFormat } from '@/lib/i18n/use-number-format';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import { cn } from '@/lib/utils';
import type { InterpolationParams } from '@/lib/i18n';
import type { Enrollment } from '@/types/api';

type TranslateFn = (key: string, params?: InterpolationParams) => string;

const STATUS_TONE: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success',
  COMPLETED: 'bg-info/10 text-info',
  CANCELLED: 'bg-destructive/10 text-destructive',
  EXPIRED: 'bg-muted text-muted-foreground'
};

const STATUS_LABEL_KEY: Record<string, string> = {
  ACTIVE: 'common.active',
  COMPLETED: 'students.completed',
  CANCELLED: 'students.cancelled',
  EXPIRED: 'students.expired'
};

export function enrollmentProgress(enrollment: Enrollment): number {
  if (typeof enrollment.progress_percent === 'number') {
    return Math.round(enrollment.progress_percent);
  }
  const steps = enrollment.progress ?? [];
  if (steps.length === 0) return 0;
  const done = steps.filter((p) => p.status === 'COMPLETED').length;
  return Math.round((done / steps.length) * 100);
}

export function EnrollmentStatusPill({
  status,
  t
}: {
  status: string;
  t: TranslateFn;
}) {
  const labelKey = STATUS_LABEL_KEY[status];
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
        STATUS_TONE[status] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {labelKey ? t(labelKey) : status}
    </span>
  );
}

interface EnrollmentsListProps {
  enrollments: readonly Enrollment[];
  isLoading: boolean;
  t: TranslateFn;
  /** Progress view drops the enrolment date and leads with the completion bar. */
  variant?: 'enrollments' | 'progress';
}

export function EnrollmentsList({
  enrollments,
  isLoading,
  t,
  variant = 'enrollments'
}: EnrollmentsListProps) {
  const formatNumber = useNumberFormat();
  const formatDate = useDateFormat();

  const columns = useMemo<DataColumn<Enrollment>[]>(() => {
    const student: DataColumn<Enrollment> = {
      id: 'student',
      header: t('students.studentName'),
      cell: (enrollment) => {
        const name = enrollment.user?.name || t('students.unknownStudent');
        const studentId = enrollment.user?.id;
        return (
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={enrollment.user?.name}
              tone={toneFromId(enrollment.user_id)}
            />
            <div className="min-w-0">
              {studentId ? (
                <Link
                  href={`/user/${studentId}`}
                  className="truncate font-semibold leading-tight hover:text-primary hover:underline"
                >
                  {name}
                </Link>
              ) : (
                <p className="truncate font-semibold leading-tight">{name}</p>
              )}
              <p className="truncate text-[11px] text-muted-foreground">
                {enrollment.course?.title || t('students.unknownCourse')}
              </p>
            </div>
          </div>
        );
      }
    };

    const progress: DataColumn<Enrollment> = {
      id: 'progress',
      header: t('students.progress'),
      className: 'min-w-[140px]',
      cell: (enrollment) => {
        const percent = enrollmentProgress(enrollment);
        return (
          <div className="flex items-center gap-2">
            <Progress value={percent} className="h-1.5 w-20" />
            <span className="text-xs font-medium">
              {formatNumber(percent / 100, { style: 'percent' })}
            </span>
          </div>
        );
      }
    };

    const status: DataColumn<Enrollment> = {
      id: 'status',
      header: t('common.status'),
      align: 'end',
      cell: (enrollment) => (
        <EnrollmentStatusPill status={enrollment.status} t={t} />
      )
    };

    if (variant === 'progress') {
      return [student, progress, status];
    }

    return [
      student,
      {
        id: 'enrolled_at',
        header: t('students.enrolledOn'),
        className: 'hidden md:table-cell',
        cell: (enrollment) => (
          <span className="text-muted-foreground">
            {formatDate(enrollment.enrolled_at)}
          </span>
        )
      },
      progress,
      status
    ];
  }, [t, formatNumber, formatDate, variant]);

  return (
    <DataList
      items={enrollments}
      columns={columns}
      rowKey={(enrollment) => enrollment.id}
      isLoading={isLoading}
      emptyState={
        <div className="py-12">
          <EmptyState
            icon={<GraduationCap className="h-10 w-10" />}
            title={t('students.noEnrollmentsFound')}
            description={t('students.adjustFilters')}
          />
        </div>
      }
    />
  );
}
