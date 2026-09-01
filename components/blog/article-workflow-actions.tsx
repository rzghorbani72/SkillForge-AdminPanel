'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  ARTICLE_STATUS,
  type Article,
  type ArticleTransition
} from '@/types/blog';

type ArticleWorkflowActionsProps = {
  article: Article;
  /** Only an editor (manager or platform owner) sees approve/reject/archive. */
  canReview: boolean;
  onRun: (
    transition: ArticleTransition,
    reviewNote?: string
  ) => void | Promise<void>;
};

/**
 * The buttons that move an article along draft → review → published → archived.
 * Which ones exist is decided by the current status, so an impossible step is
 * never offered — the backend rejects it either way.
 */
export function ArticleWorkflowActions({
  article,
  canReview,
  onRun
}: ArticleWorkflowActionsProps) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);

  const run = async (transition: ArticleTransition, reviewNote?: string) => {
    setIsBusy(true);
    try {
      await onRun(transition, reviewNote);
    } finally {
      setIsBusy(false);
    }
  };

  const handleReject = () => {
    const note = window.prompt(t('blog.rejectReasonPrompt')) ?? undefined;
    void run('reject', note);
  };

  const canSubmit =
    article.status === ARTICLE_STATUS.DRAFT ||
    article.status === ARTICLE_STATUS.ARCHIVED;
  const canApprove =
    canReview &&
    (article.status === ARTICLE_STATUS.IN_REVIEW ||
      article.status === ARTICLE_STATUS.ARCHIVED);
  const canReject = canReview && article.status === ARTICLE_STATUS.IN_REVIEW;
  const canArchive =
    canReview &&
    (article.status === ARTICLE_STATUS.PUBLISHED ||
      article.status === ARTICLE_STATUS.IN_REVIEW);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canSubmit && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isBusy}
          onClick={() => void run('submit')}
        >
          {t('blog.actions.submit')}
        </Button>
      )}
      {canApprove && (
        <Button
          type="button"
          size="sm"
          disabled={isBusy}
          onClick={() => void run('approve')}
        >
          {t('blog.actions.approve')}
        </Button>
      )}
      {canReject && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={handleReject}
        >
          {t('blog.actions.reject')}
        </Button>
      )}
      {canArchive && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => void run('archive')}
        >
          {t('blog.actions.archive')}
        </Button>
      )}
    </div>
  );
}
