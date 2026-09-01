'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { ArticleCoverField } from '@/components/blog/article-cover-field';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { sanitizeHtml } from '@/lib/sanitize';
import { useTranslation } from '@/lib/i18n/hooks';
import { uploadArticleImage } from '@/components/blog/upload-article-image';
import type { Article, ArticleInput, BlogScope } from '@/types/blog';

const MAX_CONTENT_LENGTH = 50000;

type ArticleFormProps = {
  scope: BlogScope;
  basePath: string;
  /** Absent when writing a new article. */
  article?: Article;
};

/**
 * Create or edit one article. The slug is derived by the backend from the
 * title, so it is shown but never typed — one rule for both blogs, and Persian
 * titles keep working.
 */
export function ArticleForm({ scope, basePath, article }: ArticleFormProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [title, setTitle] = useState(article?.title ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [content, setContent] = useState(article?.content ?? '');
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(
    article?.meta_description ?? ''
  );
  const [coverImageId, setCoverImageId] = useState<string | null>(
    article?.featured_image_id ?? null
  );
  const [coverUrl, setCoverUrl] = useState<string | null>(
    article?.Image?.publicUrl ?? null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      ErrorHandler.showError(t('blog.titleRequired'));
      return;
    }
    if (!content.trim()) {
      ErrorHandler.showError(t('blog.contentRequired'));
      return;
    }

    const input: ArticleInput = {
      title: title.trim(),
      content: sanitizeHtml(content),
      excerpt: excerpt.trim() || undefined,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      featured_image_id: coverImageId
    };

    setIsSaving(true);
    try {
      if (article) {
        await apiClient.updateBlogArticle(scope, article.id, input);
      } else {
        await apiClient.createBlogArticle(scope, input);
      }
      ErrorHandler.showSuccess(t('blog.saved'));
      router.push(basePath);
      router.refresh();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {article ? t('blog.editArticle') : t('blog.newArticle')}
          </CardTitle>
          {article && <CardDescription>/blog/{article.slug}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article-title">{t('blog.fields.title')}</Label>
            <Input
              id="article-title"
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <ArticleCoverField
            imageUrl={coverUrl}
            onChange={(id, url) => {
              setCoverImageId(id);
              setCoverUrl(url);
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="article-excerpt">{t('blog.fields.excerpt')}</Label>
            <Textarea
              id="article-excerpt"
              value={excerpt}
              maxLength={300}
              rows={2}
              placeholder={t('blog.fields.excerptPlaceholder')}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('blog.fields.content')}</Label>
            <TiptapEditor
              value={content}
              onChange={setContent}
              maxLength={MAX_CONTENT_LENGTH}
              placeholder={t('blog.fields.contentPlaceholder')}
              onInsertImage={uploadArticleImage}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('blog.seo.title')}</CardTitle>
          <CardDescription>{t('blog.seo.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article-meta-title">
              {t('blog.fields.metaTitle')}
            </Label>
            <Input
              id="article-meta-title"
              value={metaTitle}
              maxLength={255}
              placeholder={title}
              onChange={(event) => setMetaTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="article-meta-description">
              {t('blog.fields.metaDescription')}
            </Label>
            <Textarea
              id="article-meta-description"
              value={metaDescription}
              maxLength={300}
              rows={2}
              onChange={(event) => setMetaDescription(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {t('common.save')}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(basePath)}
          disabled={isSaving}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
