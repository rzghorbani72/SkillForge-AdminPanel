'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
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
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { markdownToHtml } from '@/lib/legal/markdown-to-html';
import { prepareLegalMarkdown } from '@/lib/legal/prepare-legal-markdown';
import { sanitizeRichText } from '@/lib/sanitize';
import {
  LEGAL_ADMIN_DOC_TYPES,
  LEGAL_ADMIN_LOCALES,
  type LegalAdminLocale,
  type LegalAdminOverview
} from '@/lib/legal/admin-types';
import type { LegalDocType } from '@/lib/legal/types';

type LegalAdminWorkspaceProps = {
  enabled: boolean;
};

export function LegalAdminWorkspace({ enabled }: LegalAdminWorkspaceProps) {
  const { t } = useTranslation();
  const [docType, setDocType] = useState<LegalDocType>('TERMS');
  const [locale, setLocale] = useState<LegalAdminLocale>('fa');
  const [overview, setOverview] = useState<LegalAdminOverview | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishVersion, setPublishVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadOverview = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await apiClient.getLegalAdminOverview(docType, locale);
      setOverview(data);
      setPublishVersion(data.suggested_version);
      if (data.draft) {
        setTitle(data.draft.title);
        setBody(data.draft.body);
      } else if (data.current) {
        const doc = await apiClient.getLegalDocument(docType, locale);
        setTitle(doc.title);
        setBody(doc.body);
      } else {
        setTitle('');
        setBody('');
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [docType, enabled, locale, t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const previewHtml = useMemo(() => {
    if (!body.trim()) return '';
    const markdown = prepareLegalMarkdown(body, locale);
    return sanitizeRichText(markdownToHtml(markdown));
  }, [body, locale]);

  async function handleSaveDraft() {
    if (!title.trim() || !body.trim()) {
      toast.error(t('legalAdmin.validationRequired'));
      return;
    }
    setSaving(true);
    try {
      await apiClient.saveLegalDraft(docType, { title, body, locale });
      toast.success(t('legalAdmin.draftSaved'));
      await loadOverview();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!publishVersion.trim()) {
      toast.error(t('legalAdmin.versionRequired'));
      return;
    }
    setPublishing(true);
    try {
      if (!overview?.draft) {
        await apiClient.saveLegalDraft(docType, { title, body, locale });
      }
      await apiClient.publishLegalDocument(docType, {
        version: publishVersion.trim(),
        locale
      });
      toast.success(t('legalAdmin.published'));
      await loadOverview();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? t('common.error'));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('legalAdmin.title')}</CardTitle>
          <CardDescription>{t('legalAdmin.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="min-w-[180px] space-y-2">
            <Label>{t('legalAdmin.documentType')}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={docType}
              onChange={(e) => setDocType(e.target.value as LegalDocType)}
            >
              {LEGAL_ADMIN_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`legalAdmin.types.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px] space-y-2">
            <Label>{t('legalAdmin.locale')}</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={locale}
              onChange={(e) => setLocale(e.target.value as LegalAdminLocale)}
            >
              {LEGAL_ADMIN_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {overview?.current && (
            <div className="flex items-end gap-2">
              <Badge variant="secondary">
                {t('legal.version')}: {overview.current.version}
              </Badge>
              {overview.draft && <Badge>{t('legalAdmin.draftExists')}</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('legalAdmin.editor')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal-title">{t('legalAdmin.docTitle')}</Label>
                <Input
                  id="legal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal-body">
                  {t('legalAdmin.markdownBody')}
                </Label>
                <Textarea
                  id="legal-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[360px] font-mono text-sm"
                  dir={locale === 'fa' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void handleSaveDraft()}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('legalAdmin.saveDraft')}
                </Button>
                <div className="flex flex-1 flex-wrap items-end gap-2">
                  <div className="min-w-[120px] space-y-2">
                    <Label htmlFor="legal-version">
                      {t('legalAdmin.publishVersion')}
                    </Label>
                    <Input
                      id="legal-version"
                      value={publishVersion}
                      onChange={(e) => setPublishVersion(e.target.value)}
                      placeholder="1.2"
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={publishing}
                    onClick={() => void handlePublish()}
                  >
                    {publishing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {t('legalAdmin.publish')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('legalAdmin.preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <article
                className="prose prose-sm dark:prose-invert max-w-none"
                dir={locale === 'fa' ? 'rtl' : 'ltr'}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {overview && overview.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('legalAdmin.history')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {overview.history.map((item) => (
                <li key={item.id} className="flex flex-wrap gap-2">
                  <span className="font-medium text-foreground">
                    v{item.version}
                  </span>
                  <span>{item.title}</span>
                  {item.published_at && (
                    <span>
                      {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
