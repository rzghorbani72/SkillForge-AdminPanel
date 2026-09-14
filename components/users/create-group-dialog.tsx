'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { studentGroupsApi } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { MemberPicker } from './member-picker';

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function CreateGroupDialog({ open, onOpenChange, onCreated }: CreateGroupDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // A reopened dialog must never carry the previous draft.
  useEffect(() => {
    if (open) return;
    setName('');
    setDescription('');
    setSelected(new Set());
  }, [open]);

  function toggleMember(profileId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    try {
      const created = await studentGroupsApi.create({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      // Members are a second call by design: the group must exist before it can
      // own anyone, and a failure here leaves a usable (empty) group behind.
      const groupId = created?.data?.id;
      if (groupId && selected.size > 0) {
        await studentGroupsApi.addMembers(groupId, Array.from(selected));
      }

      ErrorHandler.showSuccess(t('users.groupCreated'));
      onOpenChange(false);
      onCreated();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('users.newGroup')}</DialogTitle>
          <DialogDescription>{t('users.newGroupDescription')}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="group-name">{t('users.groupName')}</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">{t('common.description')}</Label>
            <Textarea
              id="group-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('users.groupMembers')}
              {selected.size > 0 && (
                <span className="ms-2 text-[12px] font-normal text-muted-foreground">
                  {t('users.selectedCount', { count: selected.size })}
                </span>
              )}
            </Label>
            <MemberPicker
              active={open}
              selected={selected}
              onToggle={toggleMember}
              disabled={isSaving}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
