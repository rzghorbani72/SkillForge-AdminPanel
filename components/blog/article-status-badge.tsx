'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { ARTICLE_STATUS, type ArticleStatus } from '@/types/blog';

const VARIANT: Record<ArticleStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [ARTICLE_STATUS.DRAFT]: 'outline',
  [ARTICLE_STATUS.IN_REVIEW]: 'secondary',
  [ARTICLE_STATUS.PUBLISHED]: 'default',
  [ARTICLE_STATUS.ARCHIVED]: 'destructive',
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  const { t } = useTranslation();

  return <Badge variant={VARIANT[status]}>{t(`blog.status.${status}`)}</Badge>;
}
