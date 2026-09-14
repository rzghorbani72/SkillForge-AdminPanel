'use client';

import { use } from 'react';

import { ArticleEditorScreen } from '@/components/blog/article-editor-screen';

export default function EditAcademyArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ArticleEditorScreen scope="academy" basePath="/website/blog" articleId={id} />;
}
