'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
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
}

interface DiscussionThreadProps {
  /** Provide exactly one parent. */
  attemptId?: string;
  submissionId?: string;
  tutoringSessionId?: string;
  threadId?: string;
  currentProfileId?: string;
}

/**
 * Reusable contextual discussion thread (teacher side). Same component shape as
 * edusphere's copy. Message bodies render as plain text — no dangerouslySetInnerHTML.
 */
export function DiscussionThread({
  attemptId,
  submissionId,
  tutoringSessionId,
  threadId,
  currentProfileId
}: DiscussionThreadProps) {
  const { t, language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeThreadId = useRef<string | undefined>(threadId);

  const parent: DiscussionParent = attemptId
    ? { attempt_id: attemptId }
    : submissionId
      ? { submission_id: submissionId }
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
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const msg = (await apiClient.postDiscussionMessage(
        parent,
        text
      )) as ThreadMessage;
      activeThreadId.current = msg.thread_id;
      setBody('');
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
          <p className="text-sm text-muted-foreground">
            {t('discussion.noMessages')}
          </p>
        )}
        {messages.map((m) => {
          const mine = currentProfileId && m.Author?.id === currentProfileId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                <p className="mb-1 text-xs opacity-70">
                  {m.Author?.display_name ?? t('discussion.user')}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('discussion.replyPlaceholder')}
          aria-label={t('discussion.replyPlaceholder')}
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button onClick={send} disabled={sending || !body.trim()} size="sm">
          <Send className="h-4 w-4" />
          <span className="sr-only">{t('discussion.send')}</span>
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
