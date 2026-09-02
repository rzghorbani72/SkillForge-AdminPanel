'use client';

import { Users } from 'lucide-react';
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
import { StatusBadge } from '@/components/shared/status-badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { CourseEnrollment } from './types';

function studentName(enrollment: CourseEnrollment, fallback: string): string {
  return (
    enrollment.user?.display_name ??
    enrollment.profile?.display_name ??
    fallback
  );
}

export function CourseEnrollmentsCard({
  enrollments
}: {
  enrollments: CourseEnrollment[];
}) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t('courseDetail.recentEnrollments')}
        </CardTitle>
        <CardDescription>
          {t('courseDetail.recentEnrollmentsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
            <Users className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">{t('courseDetail.noEnrollments')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('students.student')}</TableHead>
                <TableHead>{t('students.enrolledAt')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.slice(0, 8).map((enrollment) => {
                const name = studentName(
                  enrollment,
                  t('students.unknownStudent')
                );
                return (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {enrollment.enrolled_at
                        ? formatDate(enrollment.enrolled_at)
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={enrollment.status?.toLowerCase() ?? 'active'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
