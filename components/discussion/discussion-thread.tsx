'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { apiClient } from '@/lib/api';

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
  threadId,
  currentProfileId
}: DiscussionThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeThreadId = useRef<string | undefined>(threadId);

  const load = useCallback(async () => {
    if (!activeThreadId.current) return;
    try {
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
        attemptId ? { attempt_id: attemptId } : { submission_id: submissionId },
        text
      )) as ThreadMessage;
      activeThreadId.current = msg.thread_id;
      setBody('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        <span>Discussion</span>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
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
                  {m.Author?.display_name ?? 'User'}
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
          placeholder="Write a reply…"
          rows={2}
          maxLength={5000}
          className="flex-1"
        />
        <Button onClick={send} disabled={sending || !body.trim()} size="sm">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
