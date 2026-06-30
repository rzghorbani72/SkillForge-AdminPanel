export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketCategory =
  | 'BILLING'
  | 'PAYMENT'
  | 'COURSE_ACCESS'
  | 'LIVE_CLASS'
  | 'TECHNICAL'
  | 'CONTENT'
  | 'OTHER';

export interface TicketPerson {
  id: string;
  display_name: string;
}

export interface StaffTicketListItem {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  last_activity_at: string;
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  _count: { Message: number };
}

export interface TicketMessage {
  id: string;
  kind: 'USER_MESSAGE' | 'INTERNAL_NOTE' | 'SYSTEM_EVENT';
  body: string;
  author_id: string;
  author_role: string;
  created_at: string;
  system_event_type?: string | null;
  system_meta?: Record<string, string | null> | null;
  Author: TicketPerson | null;
  Attachment: Array<{ id: string; image_id: string; mime: string }>;
}

export interface TicketCallRequest {
  id: string;
  status: string;
  phone: string;
  outcome_note: string | null;
  called_at: string | null;
  preferred_time: string | null;
}

export interface TicketCapabilities {
  canView: boolean;
  canReply: boolean;
  canManage: boolean;
  canReassign: boolean;
  canInternalNote: boolean;
  isAuthor: boolean;
  isPlatformStaff: boolean;
}

export interface StaffTicketDetail {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  scope: 'ACADEMY' | 'PLATFORM';
  CreatedBy: TicketPerson | null;
  AssignedTo: TicketPerson | null;
  Message: TicketMessage[];
  CallRequest: TicketCallRequest[];
  Rating: { score: number; comment: string | null } | null;
  capabilities: TicketCapabilities;
}

export interface Responsible extends TicketPerson {
  role: string;
}

export const TICKET_STATUSES: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_ON_USER',
  'RESOLVED',
  'CLOSED',
  'REOPENED'
];
export const TICKET_PRIORITIES: TicketPriority[] = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
];
export const CALL_STATUSES = ['COMPLETED', 'NO_ANSWER', 'SCHEDULED'] as const;
