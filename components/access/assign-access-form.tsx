'use client';

import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EntityMultiSelect } from '@/components/shared/entity-multi-select';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import type { AccessDuration, GrantPricing } from '@/lib/api-extra';
import { AccessDurationPicker } from './access-duration-picker';
import { AccessPricingPicker } from './access-pricing-picker';
import { useAccessTargets } from './use-access-targets';

export type AssignAccessSelection = {
  profile_ids: string[];
  group_ids: string[];
  duration: AccessDuration;
  pricing: GrantPricing;
  note?: string;
};

type AssignAccessFormProps = {
  onSubmit: (selection: AssignAccessSelection) => Promise<void> | void;
  isSaving?: boolean;
  submitLabel?: string;
  enabled?: boolean;
  /** Blocks submit while something outside the form is still missing. */
  disabled?: boolean;
  /** True when the caller already fixed a target, so the pickers may stay empty. */
  hasExternalTarget?: boolean;
};

/**
 * Pick who gets access and for how long. Shared by the course pages, the bundle
 * page and the users page so "give access" means the same thing everywhere.
 */
export function AssignAccessForm({
  onSubmit,
  isSaving = false,
  submitLabel,
  enabled = true,
  disabled = false,
  hasExternalTarget = false
}: AssignAccessFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  // Mirrors the server fence in AccessGrantsService: a teacher grants their own
  // courses to their own students, free, one student at a time — no groups and
  // no money. Hiding it here keeps the form from offering a guaranteed 403.
  const isTeacher = user?.role === 'TEACHER';
  const { students, groups, isLoading } = useAccessTargets(enabled);
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [duration, setDuration] = useState<AccessDuration>({
    mode: 'days',
    days: 365
  });
  const [pricing, setPricing] = useState<GrantPricing>({ mode: 'FREE' });
  const [note, setNote] = useState('');

  const hasTarget =
    hasExternalTarget || profileIds.length > 0 || groupIds.length > 0;

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    if (!hasTarget) return;
    await onSubmit({
      profile_ids: profileIds,
      group_ids: groupIds,
      duration,
      pricing,
      note: note.trim() || undefined
    });
    setProfileIds([]);
    setGroupIds([]);
    setPricing({ mode: 'FREE' });
    setNote('');
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('accessGrants.students')}</Label>
          <EntityMultiSelect
            items={students}
            selected={profileIds}
            onChange={setProfileIds}
            disabled={isLoading || isSaving}
            labels={{
              placeholder: t('accessGrants.selectStudents'),
              selected: t('accessGrants.students'),
              search: t('common.search'),
              empty: t('accessGrants.noStudents'),
              remove: t('common.remove')
            }}
          />
        </div>

        <div className={isTeacher ? 'hidden' : 'space-y-2'}>
          <Label>{t('accessGrants.groups')}</Label>
          <EntityMultiSelect
            items={groups}
            selected={groupIds}
            onChange={setGroupIds}
            disabled={isLoading || isSaving}
            labels={{
              placeholder: t('accessGrants.selectGroups'),
              selected: t('accessGrants.groups'),
              search: t('common.search'),
              empty: t('accessGrants.noGroups'),
              remove: t('common.remove')
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('accessGrants.groupsHint')}
          </p>
        </div>
      </div>

      <AccessDurationPicker
        value={duration}
        onChange={setDuration}
        disabled={isSaving}
      />

      {!isTeacher && (
        <AccessPricingPicker
          value={pricing}
          onChange={setPricing}
          disabled={isSaving}
        />
      )}

      {pricing.mode !== 'FREE' && groupIds.length > 0 && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          {t('accessGrants.paidGroupWarning')}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="access-grant-note">{t('accessGrants.note')}</Label>
        <Textarea
          id="access-grant-note"
          rows={2}
          value={note}
          disabled={isSaving}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('accessGrants.notePlaceholder')}
        />
      </div>

      <Button
        type="button"
        onClick={() => handleSubmit()}
        disabled={!hasTarget || isSaving || disabled}
      >
        {isSaving ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="me-2 h-4 w-4" />
        )}
        {submitLabel ?? t('accessGrants.giveAccess')}
      </Button>
    </div>
  );
}
