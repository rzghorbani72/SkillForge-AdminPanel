'use client';

import { useState } from 'react';
import {
  Ban,
  CalendarPlus,
  CheckCircle2,
  Link2,
  MessageSquare,
  Pencil,
  RotateCcw,
  Video
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import {
  fromDateTimeInputValue,
  toDateTimeInputValue
} from '@/lib/i18n/calendar-date';
import { useTranslation } from '@/lib/i18n/hooks';
import type {
  ClassSession,
  ClassSessionCancelResolution,
  CourseTopic
} from '@/types/learning-operations';
import { SessionRecordingField } from './session-recording-field';
import { SessionMaterialsField } from './session-materials-field';
import { DiscussionThread } from '@/components/discussion/discussion-thread';

const NO_TOPIC = 'none';

interface SessionRowProps {
  index: number;
  session: ClassSession;
  topics: CourseTopic[];
  /** The meeting the teacher is working towards: running now, or up next. */
  isNext?: boolean;
  onChanged: (session: ClassSession) => void;
  /** A 1:1 meeting has no makeup/refund choice; the caller cancels it. */
  onCancel?: () => Promise<void>;
}

/**
 * One meeting of a class: what it is called, which topic it covers, its own
 * join link, and what it leaves behind afterwards — the recording, the
 * handouts, and the conversation the class had about it.
 */
export function SessionRow({
  index,
  session,
  topics,
  isNext = false,
  onChanged,
  onCancel
}: SessionRowProps) {
  const { t, language } = useTranslation();
  const [title, setTitle] = useState(session.title ?? '');
  const [topicId, setTopicId] = useState(session.topic_id ?? NO_TOPIC);
  const [meetingUrl, setMeetingUrl] = useState(session.meeting_url ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(() =>
    toDateTimeInputValue(new Date(session.starts_at))
  );
  const [isRescheduling, setIsRescheduling] = useState(false);

  const isCancelled = session.status === 'CANCELLED';

  const save = async () => {
    setIsSaving(true);
    try {
      const updated = await apiClient.updateClassSession(session.id, {
        title: title.trim() || null,
        topic_id: topicId === NO_TOPIC ? null : topicId,
        meeting_url: meetingUrl.trim() || null
      });
      onChanged(updated);
      toast.success(t('courses.live.sessionSaved'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const reschedule = async () => {
    const startsAt = fromDateTimeInputValue(timeValue);
    if (!startsAt) return;
    setIsRescheduling(true);
    try {
      const updated = await apiClient.rescheduleClassSession(session.id, {
        starts_at: startsAt.toISOString()
      });
      onChanged(updated);
      setIsEditingTime(false);
      toast.success(t('courses.live.sessionRescheduled'));
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const cancel = async (resolution: ClassSessionCancelResolution) => {
    try {
      await apiClient.cancelClassSession(session.id, resolution);
      onChanged({ ...session, status: 'CANCELLED' });
      toast.success(
        resolution === 'MAKEUP'
          ? t('courses.live.sessionCancelledMakeup')
          : t('courses.live.sessionCancelledRefund')
      );
    } catch (err) {
      ErrorHandler.handleApiError(err);
    }
  };

  const when = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone: session.timezone
  }).format(new Date(session.starts_at));

  return (
    <div
      className={
        isNext
          ? 'space-y-3 rounded-lg border border-primary bg-primary/5 p-4'
          : 'space-y-3 rounded-lg border p-4'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{index + 1}.</span>
          <span dir="ltr">{when}</span>
          {!isCancelled && !isEditingTime && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setTimeValue(toDateTimeInputValue(new Date(session.starts_at)));
                setIsEditingTime(true);
              }}
              aria-label={t('courses.live.editTime')}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {isNext && (
            <Badge className="gap-1">{t('courses.live.nextSession')}</Badge>
          )}
          {isCancelled && (
            <Badge variant="destructive">{t('courses.live.cancelled')}</Badge>
          )}
          {session.meeting_url && (
            <Badge variant="outline" className="gap-1">
              <Link2 className="h-3 w-3" />
              {t('courses.live.hasOwnLink')}
            </Badge>
          )}
          {session.recording_video_id && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              {t('courses.live.hasRecording')}
            </Badge>
          )}
        </div>
        {!isCancelled && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void onCancel()}
          >
            <Ban className="h-4 w-4" />
            {t('courses.live.cancelSession')}
          </Button>
        )}
        {!isCancelled && !onCancel && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Ban className="h-4 w-4" />
                {t('courses.live.cancelSession')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void cancel('MAKEUP')}>
                <CalendarPlus className="h-4 w-4" />
                {t('courses.live.cancelWithMakeup')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void cancel('REFUND')}>
                <RotateCcw className="h-4 w-4" />
                {t('courses.live.cancelWithRefund')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditingTime && (
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker
            value={timeValue}
            onChange={setTimeValue}
            withTime
            className="max-w-[220px]"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void reschedule()}
            disabled={isRescheduling}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isRescheduling ? t('common.saving') : t('common.save')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingTime(false)}
            disabled={isRescheduling}
          >
            {t('common.cancel')}
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('courses.live.sessionTitlePlaceholder')}
          disabled={isCancelled}
        />
        <Select
          value={topicId}
          onValueChange={setTopicId}
          disabled={isCancelled}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('courses.live.pickTopic')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_TOPIC}>
              {t('courses.live.noTopic')}
            </SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={isSaving || isCancelled}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {!isCancelled && (
        <>
          <div className="space-y-1">
            <Input
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder={t('courses.live.meetingUrlPlaceholder')}
              dir="ltr"
              inputMode="url"
            />
            <p className="text-xs text-muted-foreground">
              {t('courses.live.meetingUrlHint')}
            </p>
          </div>

          <SessionRecordingField
            sessionId={session.id}
            videoId={session.recording_video_id ?? null}
            allowDownload={session.recording_allow_download ?? false}
            title={title.trim()}
            onChanged={(videoId, allowDownload) =>
              onChanged({
                ...session,
                recording_video_id: videoId,
                recording_allow_download: allowDownload
              })
            }
          />

          <SessionMaterialsField
            sessionId={session.id}
            materials={session.Materials ?? []}
            onChanged={(materials) =>
              onChanged({ ...session, Materials: materials })
            }
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowChat((open) => !open)}
          >
            <MessageSquare className="h-4 w-4" />
            {t('courses.live.sessionChat')}
          </Button>
          {showChat && (
            <div className="rounded-lg border p-3">
              <DiscussionThread tutoringSessionId={session.id} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
