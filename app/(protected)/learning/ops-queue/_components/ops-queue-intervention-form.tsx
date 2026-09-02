'use client';

import { StickyNote } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StudentProfileSearchCombobox } from '@/components/entity-search';
import { DatePicker } from '@/components/ui/date-picker';
import { useTranslation } from '@/lib/i18n/hooks';

interface OpsQueueInterventionFormProps {
  noteProfileId: string;
  onNoteProfileIdChange: (value: string) => void;
  followUpAt: string;
  onFollowUpAtChange: (value: string) => void;
  noteText: string;
  onNoteTextChange: (value: string) => void;
  savingNote: boolean;
  onSave: () => void;
}

export function OpsQueueInterventionForm({
  noteProfileId,
  onNoteProfileIdChange,
  followUpAt,
  onFollowUpAtChange,
  noteText,
  onNoteTextChange,
  savingNote,
  onSave
}: OpsQueueInterventionFormProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          {t('opsQueue.interventionNote')}
        </CardTitle>
        <CardDescription>
          {t('opsQueue.interventionNoteDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="noteProfileId">{t('opsQueue.profile')}</Label>
          <StudentProfileSearchCombobox
            id="noteProfileId"
            value={noteProfileId}
            onValueChange={onNoteProfileIdChange}
            placeholder={t('opsQueue.profileIdPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="followUpAt">{t('opsQueue.followUpAt')}</Label>
          <DatePicker
            id="followUpAt"
            value={followUpAt}
            onChange={(pickedValue: string) => onFollowUpAtChange(pickedValue)}
            withTime
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="noteText">{t('opsQueue.note')}</Label>
          <Textarea
            id="noteText"
            value={noteText}
            onChange={(event) => onNoteTextChange(event.target.value)}
            rows={3}
            placeholder={t('opsQueue.notePlaceholder')}
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={() => void onSave()} disabled={savingNote}>
            {savingNote ? t('opsQueue.savingNote') : t('opsQueue.saveNote')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
