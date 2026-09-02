'use client';

import { useState } from 'react';
import { Ban, CheckCircle2, Link2, MessageSquare, Video } from 'lucide-react';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useTranslation } from '@/lib/i18n/hooks';
import type { ClassSession, CourseTopic } from '@/types/learning-operations';
import SessionRecordingField from './session-recording-field';
import SessionMaterialsField from './session-materials-field';
import { DiscussionThread } from '@/components/discussion/discussion-thread';

const NO_TOPIC = 'none';

interface SessionRowProps {
  index: number;
  session: ClassSession;
  topics: CourseTopic[];
  onChanged: (session: ClassSession) => void;
}

/**
 * One meeting of a class: what it is called, which topic it covers, its own
 * join link, and what it leaves behind afterwards — the recording, the
 * handouts, and the conversation the class had about it.
 */
export default function SessionRow({
  index,
  session,
  topics,
  onChanged
}: SessionRowProps) {
  const { t, language } = useTranslation();
  const [title, setTitle] = useState(session.title ?? '');
  const [topicId, setTopicId] = useState(session.topic_id ?? NO_TOPIC);
  const [meetingUrl, setMeetingUrl] = useState(session.meeting_url ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showChat, setShowChat] = useState(false);

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

  const cancel = async () => {
    try {
      await apiClient.cancelClassSession(session.id);
      onChanged({ ...session, status: 'CANCELLED' });
      toast.success(t('courses.live.sessionCancelled'));
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
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{index + 1}.</span>
          <span dir="ltr">{when}</span>
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
        {!isCancelled && (
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            <Ban className="h-4 w-4" />
            {t('courses.live.cancelSession')}
          </Button>
        )}
      </div>

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
