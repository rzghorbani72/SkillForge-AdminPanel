import type { LegalDocType } from './types';

export type LegalAdminDocumentSummary = {
  id: string;
  type: string;
  locale: string;
  version: string;
  title: string;
  status: string;
  is_current: boolean;
  published_at: string | null;
  created_at: string;
  content_hash: string;
};

export type LegalAdminOverview = {
  current: LegalAdminDocumentSummary | null;
  draft: {
    id: string;
    title: string;
    body: string;
    updated_at: string;
  } | null;
  suggested_version: string;
  history: LegalAdminDocumentSummary[];
};

export const LEGAL_ADMIN_DOC_TYPES: LegalDocType[] = [
  'TERMS',
  'PRIVACY',
  'REFUND',
  'ACADEMY_AGREEMENT',
];

export const LEGAL_ADMIN_LOCALES = ['fa', 'en'] as const;

export type LegalAdminLocale = (typeof LEGAL_ADMIN_LOCALES)[number];
