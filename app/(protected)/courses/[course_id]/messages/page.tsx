'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MessagesSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SectionCard } from '@/components/shared/section-card';
import { useAuthUser } from '@/components/providers/user-provider';
import { useCourseWorkspace } from '@/components/course/detail/course-workspace-context';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { StudentChatList } from './_components/student-chat-list';
import { StudentChatPane } from './_components/student-chat-pane';
import { useTeacherChats } from './_components/use-teacher-chats';

export default function CourseMessagesPage() {
  const { course_id: courseId } = useParams<{ course_id: string }>();
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const { course } = useCourseWorkspace();
  const { students, loading, failed } = useTeacherChats(courseId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = students.find((row) => row.student.id === selectedId) ?? null;

  if (loading) return <LoadingSpinner />;
  if (failed) {
    return <p className="p-6 text-sm text-destructive">{t('courseDetail.messagesLoadFailed')}</p>;
  }
  if (!students.length) {
    return (
      <EmptyState
        icon={<MessagesSquare className="h-6 w-6" />}
        title={t('courseDetail.tabMessages')}
        description={t('courseDetail.messagesEmpty')}
      />
    );
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className={cn('lg:sticky lg:top-4 lg:self-start', selected && 'hidden lg:block')}>
        <StudentChatList students={students} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <SectionCard className={cn(!selected && 'hidden lg:flex')}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                <X className="h-4 w-4" />
                {t('courseDetail.messagesClose')}
              </Button>
            </div>
            <StudentChatPane
              chats={selected}
              courseTitle={course?.title ?? ''}
              currentProfileId={user ? String(user.id) : undefined}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('courseDetail.messagesPick')}</p>
        )}
      </SectionCard>
    </div>
  );
}
