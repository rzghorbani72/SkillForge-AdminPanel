'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { Article, ArticleTransition, BlogScope } from '@/types/blog';

interface UseArticlesResult {
  articles: Article[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  runTransition: (
    id: string,
    transition: ArticleTransition,
    reviewNote?: string
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Loads and mutates the article list of one blog (academy or platform). */
export function useArticles(scope: BlogScope): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setArticles(await apiClient.getBlogArticles(scope));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runTransition = useCallback(
    async (id: string, transition: ArticleTransition, reviewNote?: string) => {
      try {
        await apiClient.transitionBlogArticle(
          scope,
          id,
          transition,
          reviewNote
        );
        await refresh();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      }
    },
    [scope, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await apiClient.deleteBlogArticle(scope, id);
        await refresh();
      } catch (error) {
        ErrorHandler.handleApiError(error);
      }
    },
    [scope, refresh]
  );

  return { articles, isLoading, refresh, runTransition, remove };
}
