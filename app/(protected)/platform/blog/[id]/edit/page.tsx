'use client';

import { use } from 'react';

import { ArticleEditorScreen } from '@/components/blog/article-editor-screen';

export default function EditPlatformArticlePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ArticleEditorScreen
      scope="platform"
      basePath="/platform/blog"
      articleId={id}
    />
  );
}
