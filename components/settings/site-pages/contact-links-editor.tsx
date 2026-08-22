'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CONTACT_CHANNELS,
  isContactChannel,
  type ContactLink
} from '@/types/academy-site';

const MAX_LINKS = 20;

const emptyLink = (): ContactLink => ({
  type: 'instagram',
  value: '',
  label: null
});

type ContactLinksEditorProps = {
  links: ContactLink[];
  onSaved: () => void;
};

/**
 * The whole channel list is edited as one ordered list and saved in one call —
 * the public site shows them in exactly this order.
 */
export function ContactLinksEditor({
  links,
  onSaved
}: ContactLinksEditorProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ContactLink[]>(links);
  const [isSaving, setIsSaving] = useState(false);

  const updateRow = (index: number, patch: Partial<ContactLink>) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const handleSave = async () => {
    const cleaned = rows
      .map((row) => ({ ...row, value: row.value.trim() }))
      .filter((row) => row.value.length > 0);

    if (cleaned.length !== rows.length) {
      ErrorHandler.showError(t('settings.sitePages.valueRequired'));
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.updateAcademyContactLinks(cleaned);
      ErrorHandler.showSuccess(t('settings.sitePages.linksSaved'));
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
        <CardTitle>{t('settings.sitePages.linksTitle')}</CardTitle>
        <CardDescription>
          {t('settings.sitePages.linksDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('settings.sitePages.emptyLinks')}
          </p>
        ) : null}

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[10rem_1fr_10rem_auto]"
            >
              <Select
                value={row.type}
                onValueChange={(value) => {
                  if (isContactChannel(value))
                    updateRow(index, { type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {t(`settings.sitePages.channels.${channel}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={row.value}
                maxLength={500}
                dir="auto"
                placeholder={t('settings.sitePages.linkValuePlaceholder')}
                aria-label={t('settings.sitePages.linkValueLabel')}
                onChange={(event) =>
                  updateRow(index, { value: event.target.value })
                }
              />

              <Input
                value={row.label ?? ''}
                maxLength={100}
                placeholder={t('settings.sitePages.linkLabelLabel')}
                aria-label={t('settings.sitePages.linkLabelLabel')}
                onChange={(event) =>
                  updateRow(index, { label: event.target.value || null })
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('settings.sitePages.removeLink')}
                onClick={() =>
                  setRows((current) => current.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={rows.length >= MAX_LINKS}
            onClick={() => setRows((current) => [...current, emptyLink()])}
          >
            <Plus className="me-2 h-4 w-4" />
            {t('settings.sitePages.addLink')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
