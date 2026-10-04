'use client';

import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { useTranslation } from '@/lib/i18n/hooks';
import type { StudentTeacherChats, TeacherChatParent } from './use-teacher-chats';

interface StudentChatPaneProps {
  chats: StudentTeacherChats;
  courseTitle: string;
  currentProfileId?: string;
}

const threadProps = (parent: TeacherChatParent) =>
  'engagement_id' in parent
    ? { engagementId: parent.engagement_id }
    : { courseChat: { courseId: parent.course_id, studentProfileId: parent.student_profile_id } };

/** One student's chats with the teacher: who wrote, from which course and class. */
export function StudentChatPane({ chats, courseTitle, currentProfileId }: StudentChatPaneProps) {
  const { t } = useTranslation();
  const name = chats.student.display_name ?? t('discussion.user');

  return (
    <div className="space-y-6">
      {chats.threads.map((thread) => (
        <div key={thread.thread_id} className="space-y-3">
          <dl className="flex flex-wrap gap-x-4 gap-y-1 rounded-md bg-muted px-3 py-2 text-xs">
            <div className="flex gap-1">
              <dt className="text-muted-foreground">{t('courseDetail.messagesStudent')}:</dt>
              <dd className="font-medium">{name}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="text-muted-foreground">{t('courseDetail.messagesCourse')}:</dt>
              <dd className="font-medium">{courseTitle}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="text-muted-foreground">{t('courseDetail.messagesClass')}:</dt>
              <dd className="font-medium">
                {thread.class_title ?? t('courseDetail.messagesNoClass')}
              </dd>
            </div>
          </dl>
          <DiscussionThread
            key={thread.thread_id}
            threadId={thread.thread_id}
            {...threadProps(thread.parent)}
            currentProfileId={currentProfileId}
            gradableAuthorId={chats.student.id}
          />
        </div>
      ))}
    </div>
  );
}
