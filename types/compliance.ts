export const ENAMAD_STATUS = {
  NOT_REQUIRED: 'NOT_REQUIRED',
  REQUIRED: 'REQUIRED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
} as const;

export type EnamadStatus = (typeof ENAMAD_STATUS)[keyof typeof ENAMAD_STATUS];

export const CONTENT_REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  FLAGGED: 'FLAGGED',
  SUSPENDED: 'SUSPENDED'
} as const;

export type ContentReviewStatus =
  (typeof CONTENT_REVIEW_STATUS)[keyof typeof CONTENT_REVIEW_STATUS];

export type EnamadState = {
  status: EnamadStatus;
  code: string | null;
  seal_id: string | null;
  title_verify: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  custom_domain: string | null;
  is_required: boolean;
  proofs_live: boolean;
  footer_live: boolean;
  file_url: string | null;
  info_email: string | null;
};

export type ReviewQueueItem = {
  academy_id: string;
  academy_name: string;
  academy_slug: string | null;
  custom_domain: string | null;
  is_public_domain: boolean;
  enamad_status: EnamadStatus;
  review_status: ContentReviewStatus;
  reviewed_at: string | null;
  last_published_at: string | null;
  legal_entity_name: string | null;
  national_id: string | null;
  keyword_hits: string[];
  priority: number;
};

export type ReviewQueueResponse = {
  items: ReviewQueueItem[];
  total: number;
  page: number;
  page_size: number;
};

export const MODERATION_POLICY = {
  PUBLISH_IMMEDIATELY: 'PUBLISH_IMMEDIATELY',
  HOLD_FOR_REVIEW: 'HOLD_FOR_REVIEW'
} as const;

export type ModerationPolicy =
  (typeof MODERATION_POLICY)[keyof typeof MODERATION_POLICY];

export const MODERATION_STATUS = {
  APPROVED: 'APPROVED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REJECTED: 'REJECTED'
} as const;

export type ModerationStatus =
  (typeof MODERATION_STATUS)[keyof typeof MODERATION_STATUS];

/** "videos, voices, files, texts" */
export const CONTENT_KIND = {
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT',
  ARTICLE: 'ARTICLE'
} as const;

export type ContentKind = (typeof CONTENT_KIND)[keyof typeof CONTENT_KIND];

export const CONTENT_KIND_VALUES = Object.values(CONTENT_KIND);

export type ModerationPolicyMap = Record<ContentKind, ModerationPolicy>;

export type ContentQueueItem = {
  id: string;
  content_kind: ContentKind;
  title: string;
  academy_id: string | null;
  academy_name: string | null;
  moderation_status: ModerationStatus;
  created_at: string;
  keyword_hits: string[];
};

export const ABUSE_STATUS = {
  OPEN: 'OPEN',
  REVIEWING: 'REVIEWING',
  ACTIONED: 'ACTIONED',
  DISMISSED: 'DISMISSED'
} as const;

export type AbuseStatus = (typeof ABUSE_STATUS)[keyof typeof ABUSE_STATUS];

export type AbuseReport = {
  id: string;
  academy_id: string | null;
  reported_url: string;
  reason: string;
  reporter_email: string | null;
  status: AbuseStatus;
  due_at: string;
  /** Past its policy deadline and still open. */
  overdue: boolean;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
};
