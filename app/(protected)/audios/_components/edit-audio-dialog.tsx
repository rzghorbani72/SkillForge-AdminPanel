'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Dispatch, SetStateAction } from 'react';
import { AudioItem } from '../_lib/page-helpers';

export function EditAudioDialog({
  editAudio,
  editDescription,
  editIsPublic,
  editTitle,
  handleUpdateAudio,
  isUpdating,
  setEditAudio,
  setEditDescription,
  setEditIsPublic,
  setEditTitle,
}: {
  editAudio: AudioItem;
  editDescription: string;
  editIsPublic: boolean;
  editTitle: string;
  handleUpdateAudio: () => Promise<void>;
  isUpdating: boolean;
  setEditAudio: Dispatch<SetStateAction<AudioItem | null>>;
  setEditDescription: Dispatch<SetStateAction<string>>;
  setEditIsPublic: Dispatch<SetStateAction<boolean>>;
  setEditTitle: Dispatch<SetStateAction<string>>;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={!!editAudio} onOpenChange={(open) => !open && setEditAudio(null)}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{t('media.editAudio')}</DialogTitle>
          <DialogDescription>{t('media.updateMetadata')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-title">{t('media.title')}</Label>
            <Input
              id="audio-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audio-description">{t('media.description')}</Label>
            <Textarea
              id="audio-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="rounded-lg"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">{t('media.publiclyAccessible')}</p>
              <p className="text-xs text-muted-foreground">{t('media.allowMembersAccess')}</p>
            </div>
            <Switch checked={editIsPublic} onCheckedChange={setEditIsPublic} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditAudio(null)} disabled={isUpdating}>
            {t('media.cancel')}
          </Button>
          <Button onClick={handleUpdateAudio} disabled={isUpdating}>
            {isUpdating ? t('media.saving') : t('media.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
