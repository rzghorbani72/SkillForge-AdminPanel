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
  submitted_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  custom_domain: string | null;
  is_required: boolean;
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
