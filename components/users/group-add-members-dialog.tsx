'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { studentGroupsApi } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { MemberPicker } from './member-picker';

type GroupAddMembersDialogProps = {
  groupId: string | null;
  /** Current members, hidden from the list so they can't be added twice. */
  existingMemberIds: string[];
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

export function GroupAddMembersDialog({
  groupId,
  existingMemberIds,
  onOpenChange,
  onAdded
}: GroupAddMembersDialogProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = !!groupId;

  useEffect(() => {
    if (isOpen) return;
    setSelected(new Set());
  }, [isOpen]);

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
    if (!groupId || selected.size === 0) return;

    setIsSaving(true);
    try {
      await studentGroupsApi.addMembers(groupId, Array.from(selected));
      ErrorHandler.showSuccess(t('users.membersAdded'));
      onOpenChange(false);
      onAdded();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.addMembers')}</DialogTitle>
          <DialogDescription>
            {t('users.addMembersDescription')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              active={isOpen}
              selected={selected}
              onToggle={toggleMember}
              excludeIds={new Set(existingMemberIds)}
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
            <Button type="submit" disabled={isSaving || selected.size === 0}>
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
