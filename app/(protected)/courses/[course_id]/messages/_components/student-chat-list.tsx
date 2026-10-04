'use client';

import { UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatDateTime, formatNumber } from '@/lib/utils';
import type { StudentTeacherChats } from './use-teacher-chats';

interface StudentChatListProps {
  students: StudentTeacherChats[];
  selectedId: string | null;
  onSelect: (studentId: string) => void;
}

export function StudentChatList({ students, selectedId, onSelect }: StudentChatListProps) {
  const { t, language } = useTranslation();

  return (
    <ul className="divide-y rounded-lg border">
      {students.map(({ student, threads, last_activity_at }) => {
        const count = threads.reduce((sum, thread) => sum + thread.message_count, 0);
        const preview = threads[0]?.last_message?.body ?? '';
        const pending = threads.reduce((sum, thread) => sum + thread.pending_grades, 0);
        const classTitles = threads
          .map((thread) => thread.class_title)
          .filter((title, index, all) => title && all.indexOf(title) === index)
          .join(' · ');
        return (
          <li key={student.id}>
            <button
              type="button"
              onClick={() => onSelect(student.id)}
              aria-current={selectedId === student.id ? 'true' : undefined}
              className={cn(
                'flex w-full items-start gap-3 p-3 text-start transition-colors hover:bg-muted/60',
                selectedId === student.id && 'bg-muted',
              )}
            >
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {student.display_name ?? t('discussion.user')}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {t('courseDetail.messagesCount').replace(
                      '{count}',
                      formatNumber(count, language),
                    )}
                  </span>
                </span>
                {classTitles ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {t('courseDetail.messagesClass')}: {classTitles}
                  </span>
                ) : null}
                {pending > 0 ? (
                  <Badge variant="secondary" className="text-[11px]">
                    {t('courseDetail.messagesPendingGrades').replace(
                      '{count}',
                      formatNumber(pending, language),
                    )}
                  </Badge>
                ) : null}
                {preview ? (
                  <span className="block truncate text-xs text-muted-foreground">{preview}</span>
                ) : null}
                <span className="block text-[11px] text-muted-foreground">
                  {formatDateTime(last_activity_at, language)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
