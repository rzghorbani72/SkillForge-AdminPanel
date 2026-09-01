'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ArticleList } from '@/components/blog/article-list';
import { useArticles } from '@/components/blog/use-articles';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslation } from '@/lib/i18n/hooks';
import type { BlogScope } from '@/types/blog';

const REVIEWER_ROLES = new Set(['MANAGER', 'ADMIN', 'PLATFORM_OWNER']);

type BlogScreenProps = {
  scope: BlogScope;
  basePath: string;
};

/** The article list screen, shared by the academy blog and the platform blog. */
export function BlogScreen({ scope, basePath }: BlogScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthUser();
  const { articles, isLoading, runTransition, remove } = useArticles(scope);

  const canReview = REVIEWER_ROLES.has(user?.role ?? '');

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {scope === 'platform'
              ? t('blog.platformTitle')
              : t('blog.academyTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('blog.description')}
          </p>
        </div>
        <Button onClick={() => router.push(`${basePath}/new`)}>
          <Plus className="me-2 h-4 w-4" />
          {t('blog.newArticle')}
        </Button>
      </div>

      <ArticleList
        articles={articles}
        isLoading={isLoading}
        canReview={canReview}
        basePath={basePath}
        onTransition={runTransition}
        onDelete={remove}
      />
    </div>
  );
}
