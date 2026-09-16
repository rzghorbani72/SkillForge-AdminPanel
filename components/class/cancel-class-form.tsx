'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/hooks';
import type { CancelClassPreview, CancelTutoringGroupPayload } from '@/types/learning-operations';
import { CancelClassMembers } from './cancel-class-members';
import { useCancelPreview } from './use-cancel-preview';

export function CancelClassForm({
  groupId,
  onConfirm,
  onClose,
}: {
  groupId: string;
  onConfirm: (payload: CancelTutoringGroupPayload) => Promise<boolean>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const { preview, invited, setInvited, inviteGroupId, setInviteGroupId, none } =
    useCancelPreview(groupId);

  const submit = async () => {
    setBusy(true);
    try {
      const ok = await onConfirm({
        reason: reason.trim() || undefined,
        invite_profile_ids: inviteGroupId === none ? [] : Array.from(invited),
        invite_group_id: inviteGroupId === none ? undefined : inviteGroupId,
      });
      if (!ok) return;
      toast.success(t('tutoring.groups.classCancelled'));
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!preview) {
    return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;
  }

  return (
    <>
      <CancelClassMembers
        members={preview.members}
        invited={invited}
        onToggle={(id, next) => {
          setInvited((current) => {
            const copy = new Set(current);
            if (next) copy.add(id);
            else copy.delete(id);
            return copy;
          });
        }}
      />
      {invited.size > 0 ? (
        <InviteGroupSelect
          groups={preview.invite_groups}
          value={inviteGroupId}
          none={none}
          onChange={setInviteGroupId}
        />
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="group-cancel-reason">{t('tutoring.groups.cancelLabel')}</Label>
        <Input
          id="group-cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button type="button" variant="destructive" disabled={busy} onClick={() => void submit()}>
          {busy ? t('common.saving') : t('tutoring.groups.cancelConfirm')}
        </Button>
      </DialogFooter>
    </>
  );
}

function InviteGroupSelect({
  groups,
  value,
  none,
  onChange,
}: {
  groups: CancelClassPreview['invite_groups'];
  value: string;
  none: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t('tutoring.groups.cancelInviteSelect')}</Label>
      {groups.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('tutoring.groups.cancelInviteNone')}</p>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('tutoring.groups.cancelInviteSelect')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={none}>{t('tutoring.groups.cancelInviteSkip')}</SelectItem>
            {groups.map((row) => (
              <SelectItem key={row.id} value={row.id} disabled={row.seats_left < 1}>
                {row.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
