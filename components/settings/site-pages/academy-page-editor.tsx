'use client';

import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { AcademyPage } from '@/types/academy-site';

const MAX_BODY_LENGTH = 20000;

type AcademyPageEditorProps = {
  page: AcademyPage;
  onSaved: () => void;
};

/** One editable static page (About or Contact) of the academy website. */
export function AcademyPageEditor({ page, onSaved }: AcademyPageEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body);
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [isSaving, setIsSaving] = useState(false);

  const heading =
    page.slug === 'about' ? t('settings.sitePages.pageAbout') : t('settings.sitePages.pageContact');

  const handleSave = async () => {
    if (!title.trim()) {
      ErrorHandler.showError(t('settings.sitePages.titleRequired'));
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.updateAcademyPage(page.slug, {
        title: title.trim(),
        body,
        is_published: isPublished,
      });
      ErrorHandler.showSuccess(t('settings.sitePages.pageSaved'));
      onSaved();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>/{page.slug}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`title-${page.slug}`}>{t('settings.sitePages.pageTitleLabel')}</Label>
          <Input
            id={`title-${page.slug}`}
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('settings.sitePages.pageBodyLabel')}</Label>
          <MarkdownEditor
            value={body}
            onChange={setBody}
            maxLength={MAX_BODY_LENGTH}
            minRows={8}
            placeholder={t('settings.sitePages.pageBodyPlaceholder')}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor={`publish-${page.slug}`}>{t('settings.sitePages.publishLabel')}</Label>
            <p className="text-xs text-muted-foreground">{t('settings.sitePages.publishHint')}</p>
          </div>
          <Switch
            id={`publish-${page.slug}`}
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {t('common.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
