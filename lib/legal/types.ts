export type LegalDocType =
  | 'TERMS'
  | 'PRIVACY'
  | 'REFUND'
  | 'ACADEMY_AGREEMENT'
  | 'STAFF_TERMS'
  | 'ACCEPTABLE_USE';

export type LegalDocument = {
  id: string;
  type: string;
  locale: string;
  version: string;
  title: string;
  body: string;
  content_hash: string;
  is_current: boolean;
  published_at: string | null;
};
