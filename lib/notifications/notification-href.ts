import type { NotificationLink } from '@/lib/api';

function discussionHref(link: NotificationLink): string | null {
  if (link.course_id && link.student_profile_id) {
    return `/courses/${link.course_id}/messages?student=${link.student_profile_id}`;
  }
  if (link.engagement_id) return `/tutoring/engagements/${link.engagement_id}`;
  if (link.submission_id) return '/assignments';
  return null;
}

/** Panel page a notification opens; null when the panel has no page for it. */
export function notificationHref(link: NotificationLink | null): string | null {
  if (!link) return null;
  switch (link.target) {
    case 'DISCUSSION':
      return discussionHref(link);
    case 'CLASS_REQUEST':
    case 'COURSE_QNA':
      return link.course_id ? `/courses/${link.course_id}/requests` : null;
    case 'TUTORING_GROUP':
      return link.course_id && link.tutoring_group_id
        ? `/courses/${link.course_id}/live/${link.tutoring_group_id}`
        : null;
    case 'SUPPORT_TICKET':
      return link.ticket_id ? `/support?ticket=${link.ticket_id}` : '/support';
    case 'ORDER':
      return '/payments';
    case 'BILLING':
      return '/billing';
    case 'BANK_ACCOUNT':
      return '/settings/profile#kyc';
    default:
      return null;
  }
}
