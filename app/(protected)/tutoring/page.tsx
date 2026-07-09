'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  TutoringAttendanceStatus,
  TutoringEngagement,
  TutoringSession
} from '@/types/learning-operations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type CourseOption = { id: string; title: string };

export default function TutoringPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [engagements, setEngagements] = useState<TutoringEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseFilter, setCourseFilter] = useState('all');
  const [lastSession, setLastSession] = useState<TutoringSession | null>(null);

  const [engagementForm, setEngagementForm] = useState({
    course_id: '',
    student_profile_id: '',
    tutor_profile_id: '',
    ends_at: ''
  });

  const [sessionForm, setSessionForm] = useState({
    engagement_id: '',
    starts_at: '',
    ends_at: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    meeting_url: '',
    notes: ''
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    session_id: '',
    starts_at: '',
    ends_at: '',
    meeting_url: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    session_id: '',
    profile_id: '',
    status: 'PRESENT' as TutoringAttendanceStatus
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesResponse, engagementsResponse] = await Promise.all([
        apiClient.getCourses({ page: 1, limit: 100 }),
        apiClient.getTutoringEngagements(
          courseFilter !== 'all' ? { course_id: courseFilter } : undefined
        )
      ]);
      const courseList = (coursesResponse.courses ?? []).map((course) => ({
        id: String(course.id),
        title: course.title
      }));
      setCourses(courseList);
      setEngagements(engagementsResponse);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  }, [courseFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeEngagements = useMemo(
    () => engagements.filter((item) => item.status === 'ACTIVE'),
    [engagements]
  );

  const createEngagement = async () => {
    if (
      !engagementForm.course_id ||
      !engagementForm.student_profile_id ||
      !engagementForm.tutor_profile_id
    ) {
      return;
    }
    setSaving(true);
    try {
      await apiClient.createTutoringEngagement({
        course_id: engagementForm.course_id,
        student_profile_id: engagementForm.student_profile_id,
        tutor_profile_id: engagementForm.tutor_profile_id,
        ends_at: engagementForm.ends_at || undefined
      });
      setEngagementForm({
        course_id: '',
        student_profile_id: '',
        tutor_profile_id: '',
        ends_at: ''
      });
      await loadData();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const scheduleSession = async () => {
    if (!sessionForm.engagement_id || !sessionForm.starts_at) return;
    setSaving(true);
    try {
      const session = await apiClient.scheduleTutoringSession({
        engagement_id: sessionForm.engagement_id,
        starts_at: new Date(sessionForm.starts_at).toISOString(),
        ends_at: sessionForm.ends_at
          ? new Date(sessionForm.ends_at).toISOString()
          : undefined,
        timezone: sessionForm.timezone,
        meeting_url: sessionForm.meeting_url || undefined,
        notes: sessionForm.notes || undefined
      });
      setLastSession(session);
      setSessionForm((prev) => ({
        ...prev,
        starts_at: '',
        ends_at: '',
        meeting_url: '',
        notes: ''
      }));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const rescheduleSession = async () => {
    if (!rescheduleForm.session_id || !rescheduleForm.starts_at) return;
    setSaving(true);
    try {
      const session = await apiClient.rescheduleTutoringSession(
        rescheduleForm.session_id,
        {
          starts_at: new Date(rescheduleForm.starts_at).toISOString(),
          ends_at: rescheduleForm.ends_at
            ? new Date(rescheduleForm.ends_at).toISOString()
            : undefined,
          meeting_url: rescheduleForm.meeting_url || undefined
        }
      );
      setLastSession(session);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const session = await apiClient.cancelTutoringSession(sessionId, {
        reason: t('tutoring.cancelReasonDefault')
      });
      setLastSession(session);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const markAttendance = async () => {
    if (!attendanceForm.session_id || !attendanceForm.profile_id) return;
    setSaving(true);
    try {
      await apiClient.markTutoringAttendance(attendanceForm.session_id, {
        profile_id: attendanceForm.profile_id,
        status: attendanceForm.status
      });
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="space-y-6 p-4 sm:p-6"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-labelledby="tutoring-title"
    >
      <div>
        <h1 id="tutoring-title" className="text-3xl font-bold tracking-tight">
          {t('tutoring.title')}
        </h1>
        <p className="text-muted-foreground">{t('tutoring.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tutoring.engagements')}</CardTitle>
          <CardDescription>
            {t('tutoring.engagementsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full space-y-2 sm:max-w-xs">
              <Label>{t('tutoring.filterCourse')}</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tutoring.allCourses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('tutoring.allCourses')}
                  </SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => void loadData()}>
              {t('common.refresh')}
            </Button>
          </div>

          {loading ? (
            <div className="flex min-h-32 items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : engagements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('tutoring.noEngagements')}
            </p>
          ) : (
            <div className="space-y-3">
              {engagements.map((engagement) => (
                <div
                  key={engagement.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {engagement.Course?.title ?? engagement.course_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {engagement.Student?.display_name ??
                        engagement.student_profile_id}{' '}
                      ↔{' '}
                      {engagement.Tutor?.display_name ??
                        engagement.tutor_profile_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {engagement.id}
                    </p>
                  </div>
                  <Badge variant="outline">{engagement.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('tutoring.createEngagement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{t('tutoring.course')}</Label>
              <Select
                value={engagementForm.course_id}
                onValueChange={(value) =>
                  setEngagementForm((prev) => ({ ...prev, course_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('tutoring.selectCourse')} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentProfile">
                {t('tutoring.studentProfileId')}
              </Label>
              <Input
                id="studentProfile"
                value={engagementForm.student_profile_id}
                onChange={(event) =>
                  setEngagementForm((prev) => ({
                    ...prev,
                    student_profile_id: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutorProfile">
                {t('tutoring.tutorProfileId')}
              </Label>
              <Input
                id="tutorProfile"
                value={engagementForm.tutor_profile_id}
                onChange={(event) =>
                  setEngagementForm((prev) => ({
                    ...prev,
                    tutor_profile_id: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">{t('tutoring.endsAtOptional')}</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={engagementForm.ends_at}
                onChange={(event) =>
                  setEngagementForm((prev) => ({
                    ...prev,
                    ends_at: event.target.value
                  }))
                }
              />
            </div>
            <Button onClick={() => void createEngagement()} disabled={saving}>
              {t('tutoring.activateEngagement')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('tutoring.scheduleSession')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{t('tutoring.engagement')}</Label>
              <Select
                value={sessionForm.engagement_id}
                onValueChange={(value) =>
                  setSessionForm((prev) => ({ ...prev, engagement_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('tutoring.selectEngagement')} />
                </SelectTrigger>
                <SelectContent>
                  {activeEngagements.map((engagement) => (
                    <SelectItem key={engagement.id} value={engagement.id}>
                      {engagement.Course?.title ?? engagement.course_id} ·{' '}
                      {engagement.Student?.display_name ??
                        engagement.student_profile_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">{t('tutoring.startsAt')}</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={sessionForm.starts_at}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    starts_at: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAtSession">
                {t('tutoring.endsAtOptional')}
              </Label>
              <Input
                id="endsAtSession"
                type="datetime-local"
                value={sessionForm.ends_at}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    ends_at: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t('tutoring.timezone')}</Label>
              <Input
                id="timezone"
                value={sessionForm.timezone}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    timezone: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">{t('tutoring.meetingUrl')}</Label>
              <Input
                id="meetingUrl"
                value={sessionForm.meeting_url}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    meeting_url: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t('tutoring.notes')}</Label>
              <Textarea
                id="notes"
                value={sessionForm.notes}
                onChange={(event) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    notes: event.target.value
                  }))
                }
                rows={2}
              />
            </div>
            <Button onClick={() => void scheduleSession()} disabled={saving}>
              {t('tutoring.schedule')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('tutoring.rescheduleOrCancel')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sessionId">{t('tutoring.sessionId')}</Label>
              <Input
                id="sessionId"
                value={rescheduleForm.session_id}
                onChange={(event) =>
                  setRescheduleForm((prev) => ({
                    ...prev,
                    session_id: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescheduleStarts">{t('tutoring.startsAt')}</Label>
              <Input
                id="rescheduleStarts"
                type="datetime-local"
                value={rescheduleForm.starts_at}
                onChange={(event) =>
                  setRescheduleForm((prev) => ({
                    ...prev,
                    starts_at: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescheduleEnds">
                {t('tutoring.endsAtOptional')}
              </Label>
              <Input
                id="rescheduleEnds"
                type="datetime-local"
                value={rescheduleForm.ends_at}
                onChange={(event) =>
                  setRescheduleForm((prev) => ({
                    ...prev,
                    ends_at: event.target.value
                  }))
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void rescheduleSession()}
                disabled={saving}
              >
                {t('tutoring.reschedule')}
              </Button>
              <Button
                variant="outline"
                onClick={() => void cancelSession(rescheduleForm.session_id)}
                disabled={saving || !rescheduleForm.session_id}
              >
                {t('tutoring.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('tutoring.markAttendance')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="attendanceSession">
                {t('tutoring.sessionId')}
              </Label>
              <Input
                id="attendanceSession"
                value={attendanceForm.session_id}
                onChange={(event) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    session_id: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendanceProfile">
                {t('tutoring.profileId')}
              </Label>
              <Input
                id="attendanceProfile"
                value={attendanceForm.profile_id}
                onChange={(event) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    profile_id: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t('tutoring.attendanceStatus')}</Label>
              <Select
                value={attendanceForm.status}
                onValueChange={(value) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    status: value as TutoringAttendanceStatus
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">
                    {t('tutoring.status.PRESENT')}
                  </SelectItem>
                  <SelectItem value="JOINED">
                    {t('tutoring.status.JOINED')}
                  </SelectItem>
                  <SelectItem value="ABSENT">
                    {t('tutoring.status.ABSENT')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void markAttendance()} disabled={saving}>
              {t('tutoring.saveAttendance')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {lastSession && (
        <Card>
          <CardHeader>
            <CardTitle>{t('tutoring.lastSessionResult')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {t('tutoring.sessionId')}: {lastSession.id}
            </p>
            <p>
              {t('common.status')}: {lastSession.status}
            </p>
            <p>
              {t('tutoring.startsAt')}:{' '}
              {new Date(lastSession.starts_at).toLocaleString(language)}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
