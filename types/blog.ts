export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ArticleStatus = (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS];

/** Which blog a screen is editing. Decides the API prefix and nothing else. */
export type BlogScope = 'academy' | 'platform';

export interface ArticleAuthor {
  id: string;
  display_name: string;
}

export interface ArticleImage {
  id: string;
  publicUrl: string | null;
  alt: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  excerpt: string | null;
  status: ArticleStatus;
  review_note: string | null;
  is_featured: boolean;
  view_count: number;
  read_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  academy_id: string | null;
  featured_image_id: string | null;
  Profile: ArticleAuthor | null;
  AdminProfile: ArticleAuthor | null;
  Image: ArticleImage | null;
}

export interface ArticleInput {
  title: string;
  content: string;
  description?: string;
  excerpt?: string;
  featured_image_id?: string | null;
  meta_title?: string;
  meta_description?: string;
  read_time?: number;
  is_featured?: boolean;
}

export type ArticleTransition = 'submit' | 'approve' | 'reject' | 'archive';

export const articleAuthorName = (article: Article): string =>
  article.Profile?.display_name ?? article.AdminProfile?.display_name ?? '';
