'use client';

import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { ArticleForm } from '@/components/blog/article-form';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { Article, BlogScope } from '@/types/blog';

type ArticleEditorScreenProps = {
  scope: BlogScope;
  basePath: string;
  /** Absent when creating a new article. */
  articleId?: string;
};

/** Loads one article (when editing) and renders the form for both blogs. */
export function ArticleEditorScreen({ scope, basePath, articleId }: ArticleEditorScreenProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(articleId));

  useEffect(() => {
    if (!articleId) return;
    let active = true;

    const load = async () => {
      try {
        const loaded = await apiClient.getBlogArticle(scope, articleId);
        if (active) setArticle(loaded);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [scope, articleId]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      {isLoading ? (
        <Skeleton className="h-[480px]" />
      ) : (
        <ArticleForm scope={scope} basePath={basePath} article={article ?? undefined} />
      )}
    </div>
  );
}
