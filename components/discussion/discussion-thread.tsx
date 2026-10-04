'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Paperclip, Send, X } from 'lucide-react';
import {
  MessageAttachment,
  type ThreadAttachment,
} from '@/components/discussion/message-attachment';
import { MessageGrade } from '@/components/discussion/message-grade';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import type { DiscussionParent } from '@/types/learning-operations';
import { apiErrorMessage } from '@/lib/api-error-message';

interface ThreadMessage {
  id: string;
  thread_id: string;
  body: string;
  created_at: string;
  Author?: { id: string; display_name: string | null };
  Document?: ThreadAttachment | null;
  score?: number | null;
}

interface DiscussionThreadProps {
  /** Provide exactly one parent. */
  attemptId?: string;
  submissionId?: string;
  tutoringSessionId?: string;
  engagementId?: string;
  /** Course teacher chat: which student's chat staff are answering. */
  courseChat?: { courseId: string; studentProfileId: string };
  threadId?: string;
  currentProfileId?: string;
  /** Files this author hands in get a grade box (the chat's student). */
  gradableAuthorId?: string;
}

/**
 * Reusable contextual discussion thread (teacher side). Same component shape as
 * edusphere's copy. Message bodies render as plain text — no dangerouslySetInnerHTML.
 */
export function DiscussionThread({
  attemptId,
  submissionId,
  tutoringSessionId,
  engagementId,
  courseChat,
  threadId,
  currentProfileId,
  gradableAuthorId,
}: DiscussionThreadProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const activeThreadId = useRef<string | undefined>(threadId);

  const parent: DiscussionParent = attemptId
    ? { attempt_id: attemptId }
    : submissionId
      ? { submission_id: submissionId }
      : engagementId
        ? { engagement_id: engagementId }
        : courseChat
          ? { course_id: courseChat.courseId, student_profile_id: courseChat.studentProfileId }
          : { tutoring_session_id: tutoringSessionId };
  const parentRef = useRef(parent);
  parentRef.current = parent;

  // A thread is created lazily on the first message, so an id may not exist
  // yet: look it up by its parent before giving up on showing history.
  const load = useCallback(async () => {
    try {
      if (!activeThreadId.current) {
        const found = await apiClient.findDiscussionThread<{
          id?: string;
        } | null>(parentRef.current);
        if (!found?.id) return;
        activeThreadId.current = found.id;
      }
      const data = await apiClient.getDiscussionThread<{
        messages: ThreadMessage[];
      }>(activeThreadId.current);
      setMessages(data.messages);
    } catch {
      /* thread not created until the first message */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    const text = body.trim();
    if (!text && !file) return;
    setSending(true);
    setError(null);
    try {
      let documentId: string | undefined;
      if (file) {
        try {
          documentId = (await apiClient.uploadDiscussionAttachment(file)).id;
        } catch (e) {
          setError(apiErrorMessage(e, t('discussion.uploadFailed')));
          return;
        }
      }
      const msg = (await apiClient.postDiscussionMessage(
        parent,
        text,
        documentId,
      )) as ThreadMessage;
      activeThreadId.current = msg.thread_id;
      setBody('');
      setFile(null);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e, t('discussion.sendFailed')));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        <span>{t('discussion.title')}</span>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('discussion.noMessages')}</p>
        )}
        {messages.map((m) => {
          const mine = currentProfileId && m.Author?.id === currentProfileId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                <p className="mb-1 text-xs opacity-70">
                  {m.Author?.display_name ?? t('discussion.user')}
                </p>
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                {m.Document && <MessageAttachment attachment={m.Document} mine={Boolean(mine)} />}
                {gradableAuthorId && m.Document && m.Author?.id === gradableAuthorId && (
                  <MessageGrade messageId={m.id} score={m.score ?? null} onGraded={load} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {file && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
          <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            aria-label={t('discussion.removeAttachment')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInput}
          type="file"
          hidden
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
          disabled={sending}
          aria-label={t('discussion.attachFile')}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('discussion.replyPlaceholder')}
          aria-label={t('discussion.replyPlaceholder')}
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button onClick={send} disabled={sending || (!body.trim() && !file)} size="sm">
          <Send className="h-4 w-4" />
          <span className="sr-only">{t('discussion.send')}</span>
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
