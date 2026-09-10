'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function SuggestionForm() {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await apiClient.createPlatformTicket({
        subject: `${t('support.help.suggestionPrefix')} ${subject.trim()}`,
        category: 'OTHER',
        body: body.trim()
      });
      toast.success(t('support.help.suggestionSent'));
      setSubject('');
      setBody('');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={t('support.help.suggestionTitle')}
          description={t('support.help.suggestionSubtitle')}
          icon={<Lightbulb className="h-5 w-5" />}
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="suggestion-subject">{t('support.subject')}</Label>
              <Input
                id="suggestion-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('support.help.suggestionSubjectPlaceholder')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="suggestion-body">{t('support.message')}</Label>
              <Textarea
                id="suggestion-body"
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('support.help.suggestionBodyPlaceholder')}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  void submit();
                }}
                disabled={saving || !subject.trim() || !body.trim()}
              >
                {saving ? t('common.saving') : t('support.help.sendSuggestion')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
