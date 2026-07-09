'use client';

import { ArrowLeft, ClipboardList, UserRound } from 'lucide-react';
import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Enrollment, User } from '@/types/api';
import type {
  AssignmentSubmission,
  LearningActivity,
  LearningSummaryEnrollment
} from '@/types/learning-operations';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscussionThread } from '@/components/discussion/discussion-thread';

interface StudentWorkspaceProps {
  student: User;
  enrollments: Enrollment[];
  submissions: AssignmentSubmission[];
  summaryEnrollments: LearningSummaryEnrollment[];
  timeline: LearningActivity[];
  profileId: string | null;
  learningUnavailable: boolean;
}

function progressValue(enrollment: Enrollment): number | null {
  return typeof enrollment.progress_percent === 'number'
    ? Math.round(enrollment.progress_percent)
    : null;
}

function formatDate(
  value: string | null | undefined,
  language: string
): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(language);
}

export function StudentWorkspace({
  student,
  enrollments,
  submissions,
  summaryEnrollments,
  timeline,
  profileId,
  learningUnavailable
}: StudentWorkspaceProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const completedCount = enrollments.filter(
    (item) => item.status === 'COMPLETED'
  ).length;
  const progressSource =
    summaryEnrollments.length > 0 ? 'summary' : 'enrollments';

  return (
    <main
      className="space-y-6 p-4 sm:p-6"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-labelledby="student-workspace-title"
    >
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/students?role=STUDENT">
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('learningOperations.backToStudents')}
        </Link>
      </Button>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        <Avatar className="h-14 w-14">
          <AvatarFallback>
            {(student.display_name || student.name || 'S').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1
            id="student-workspace-title"
            className="truncate text-2xl font-bold"
          >
            {student.display_name || student.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {student.email || student.phone_number}
          </p>
          {profileId && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('learningOperations.profileId')}: {profileId}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {t('learningOperations.enrollmentCount', {
              count: enrollments.length
            })}
          </Badge>
          <Badge variant="secondary">
            {t('learningOperations.completedCount', { count: completedCount })}
          </Badge>
        </div>
      </section>

      <Tabs defaultValue="progress">
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="progress">{t('navigation.progress')}</TabsTrigger>
          <TabsTrigger value="timeline">
            {t('learningOperations.timeline')}
          </TabsTrigger>
          <TabsTrigger value="assignments">
            {t('navigation.assignments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="progress"
          className="grid gap-4 pt-4 lg:grid-cols-2"
        >
          {progressSource === 'summary' ? (
            summaryEnrollments.map((enrollment) => {
              const value =
                typeof enrollment.progress_percent === 'number'
                  ? Math.round(enrollment.progress_percent)
                  : null;
              return (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {enrollment.Course?.title ?? t('students.unknownCourse')}
                    </CardTitle>
                    <CardDescription>{enrollment.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {value === null ? (
                      <p className="text-sm text-muted-foreground">
                        {t('learningOperations.progressUnavailable')}
                      </p>
                    ) : (
                      <>
                        <Progress value={value} />
                        <p className="text-sm font-medium">{value}%</p>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('learningOperations.lastAccessed')}:{' '}
                      {formatDate(enrollment.last_accessed, language)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('learningOperations.videoHeartbeats')}:{' '}
                      {enrollment.video_heartbeats}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : enrollments.length === 0 ? (
            <EmptyState text={t('learningOperations.noEnrollments')} />
          ) : (
            enrollments.map((enrollment) => {
              const value = progressValue(enrollment);
              return (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {enrollment.course?.title ?? t('students.unknownCourse')}
                    </CardTitle>
                    <CardDescription>{enrollment.status}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {value === null ? (
                      <p className="text-sm text-muted-foreground">
                        {t('learningOperations.progressUnavailable')}
                      </p>
                    ) : (
                      <>
                        <Progress value={value} />
                        <p className="text-sm font-medium">{value}%</p>
                      </>
                    )}
                    {learningUnavailable && (
                      <p className="text-xs text-muted-foreground">
                        {t('learningOperations.summaryUnavailable')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-3 pt-4">
          {timeline.length === 0 ? (
            <EmptyState
              text={
                learningUnavailable
                  ? t('learningOperations.timelineUnavailable')
                  : t('learningOperations.noTimeline')
              }
            />
          ) : (
            timeline.map((activity) => (
              <Card key={activity.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-4 w-4" />
                    {(() => {
                      const key = `learningOperations.activity.${activity.activity_type}`;
                      const label = t(key);
                      return label === key ? activity.activity_type : label;
                    })()}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(activity.created_at, language)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  {activity.course_id && (
                    <p>
                      {t('learningOperations.courseId')}: {activity.course_id}
                    </p>
                  )}
                  {activity.lesson_id && (
                    <p>
                      {t('learningOperations.lessonId')}: {activity.lesson_id}
                    </p>
                  )}
                  {activity.enrollment_id && (
                    <p>
                      {t('learningOperations.enrollmentId')}:{' '}
                      {activity.enrollment_id}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4 pt-4">
          {submissions.length === 0 ? (
            <EmptyState text={t('learningOperations.noSubmissions')} />
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {submission.Assignment?.title ??
                      t('assignmentsPage.notAvailable')}
                  </CardTitle>
                  <CardDescription>{submission.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.score !== undefined && (
                    <Badge variant="outline">
                      {submission.score} / {submission.Assignment?.max_score}
                    </Badge>
                  )}
                  <DiscussionThread
                    submissionId={String(submission.id)}
                    threadId={submission.discussion_thread_id}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <UserRound className="h-8 w-8" />
        <p className="text-sm">{text}</p>
      </CardContent>
    </Card>
  );
}
