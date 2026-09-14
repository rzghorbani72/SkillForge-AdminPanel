'use client';

import { useRouter } from 'next/navigation';
import { FileText, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataList, type DataColumn } from '@/components/shared/data-list';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArticleStatusBadge } from '@/components/blog/article-status-badge';
import { ArticleWorkflowActions } from '@/components/blog/article-workflow-actions';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { formatDate, formatNumber } from '@/lib/utils';
import { articleAuthorName, type Article, type ArticleTransition } from '@/types/blog';

type ArticleListProps = {
  articles: Article[];
  isLoading: boolean;
  canReview: boolean;
  basePath: string;
  onTransition: (id: string, transition: ArticleTransition, reviewNote?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

/**
 * The authoring list. Above four articles it becomes a table, because a card
 * grid stops being scannable — see CARD_VIEW_MAX_ITEMS in data-list.
 */
export function ArticleList({
  articles,
  isLoading,
  canReview,
  basePath,
  onTransition,
  onDelete,
}: ArticleListProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const router = useRouter();

  const openEditor = (article: Article) => router.push(`${basePath}/${article.id}/edit`);

  const columns: ReadonlyArray<DataColumn<Article>> = [
    {
      id: 'title',
      header: t('blog.fields.title'),
      cell: (article) => (
        <div className="space-y-1">
          <p className="font-medium">{article.title}</p>
          <p className="text-xs text-muted-foreground">/{article.slug}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: t('blog.fields.status'),
      cell: (article) => <ArticleStatusBadge status={article.status} />,
    },
    {
      id: 'author',
      header: t('blog.fields.author'),
      cell: (article) => articleAuthorName(article),
    },
    {
      id: 'published',
      header: t('blog.fields.publishedAt'),
      cell: (article) => (article.published_at ? formatDate(article.published_at, language) : '—'),
    },
    {
      id: 'views',
      header: t('blog.fields.views'),
      align: 'end',
      cell: (article) => formatNumber(article.view_count, language),
    },
    {
      id: 'actions',
      header: '',
      align: 'end',
      cell: (article) => (
        <div
          className="flex items-center justify-end gap-2"
          // The row itself opens the editor; the buttons must not do both.
          onClick={(event) => event.stopPropagation()}
        >
          <ArticleWorkflowActions
            article={article}
            canReview={canReview}
            onRun={(transition, note) => onTransition(article.id, transition, note)}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('common.delete')}
            onClick={() => void onDelete(article.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const renderCard = (article: Article) => (
    <Card
      key={article.id}
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => openEditor(article)}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{article.title}</p>
          <ArticleStatusBadge status={article.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt ?? article.description ?? ''}
        </p>
        <div onClick={(event) => event.stopPropagation()}>
          <ArticleWorkflowActions
            article={article}
            canReview={canReview}
            onRun={(transition, note) => onTransition(article.id, transition, note)}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataList
      items={articles}
      columns={columns}
      rowKey={(article) => article.id}
      renderCard={renderCard}
      onRowClick={openEditor}
      isLoading={isLoading}
      emptyState={
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title={t('blog.empty.title')}
          description={t('blog.empty.description')}
        />
      }
    />
  );
}
