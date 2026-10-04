'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EntityMultiSelect } from '@/components/shared/entity-multi-select';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import type { AccessDuration, GrantPricing } from '@/lib/api-extra';
import { AccessDurationPicker } from './access-duration-picker';
import { AccessPricingPicker } from './access-pricing-picker';
import { AccessFormStep } from './access-form-step';
import { AssignAccessSubmit } from './assign-access-submit';
import { useAccessTargets } from './use-access-targets';

export type AssignAccessSelection = {
  profile_ids: string[];
  group_ids: string[];
  duration: AccessDuration;
  pricing: GrantPricing;
  note?: string;
};

type AssignAccessFormProps = {
  /** Restores a selection the caller kept, so the form survives being unmounted. */
  initialSelection?: AssignAccessSelection | null;
  onSubmit?: (selection: AssignAccessSelection) => Promise<void> | void;
  /**
   * Reports the current selection instead of submitting it. Given this, the
   * form drops its own button and the page's save owns the grant.
   */
  onSelectionChange?: (selection: AssignAccessSelection | null) => void;
  isSaving?: boolean;
  submitLabel?: string;
  enabled?: boolean;
  /** Blocks submit while something outside the form is still missing. */
  disabled?: boolean;
  /** Explains the `disabled` block to the manager, e.g. "pick a course first". */
  disabledHint?: string;
  /** True when the caller already fixed a target, so the pickers may stay empty. */
  hasExternalTarget?: boolean;
  /** Rendered inside step 1, under the pickers (e.g. who already has access). */
  targetsFooter?: ReactNode;
  /** Students who already hold access: shown checked, unchecking revokes. */
  grantedStudentIds?: string[];
  onRevokeStudent?: (profileId: string) => void;
};

/**
 * Pick who gets access and for how long. Shared by the course pages, the bundle
 * page and the users page so "give access" means the same thing everywhere.
 */
export function AssignAccessForm({
  initialSelection,
  onSubmit,
  onSelectionChange,
  isSaving = false,
  submitLabel,
  enabled = true,
  disabled = false,
  disabledHint,
  hasExternalTarget = false,
  targetsFooter,
  grantedStudentIds,
  onRevokeStudent,
}: AssignAccessFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  // Mirrors the server fence in AccessGrantsService: a teacher grants their own
  // courses to their own students, free, one student at a time — no groups and
  // no money. Hiding it here keeps the form from offering a guaranteed 403.
  const isTeacher = user?.role === 'TEACHER';
  const { students, groups, isLoading } = useAccessTargets(enabled);
  const [profileIds, setProfileIds] = useState<string[]>(initialSelection?.profile_ids ?? []);
  const [groupIds, setGroupIds] = useState<string[]>(initialSelection?.group_ids ?? []);
  const [duration, setDuration] = useState<AccessDuration>(
    initialSelection?.duration ?? { mode: 'days', days: 365 },
  );
  const [pricing, setPricing] = useState<GrantPricing>(
    initialSelection?.pricing ?? { mode: 'FREE' },
  );
  const [note, setNote] = useState(initialSelection?.note ?? '');

  const hasTarget = hasExternalTarget || profileIds.length > 0 || groupIds.length > 0;

  // Held in a ref so an inline callback cannot re-fire the effect every render.
  const emitRef = useRef(onSelectionChange);
  emitRef.current = onSelectionChange;

  useEffect(() => {
    emitRef.current?.(
      hasTarget
        ? {
            profile_ids: profileIds,
            group_ids: groupIds,
            duration,
            pricing,
            note: note.trim() || undefined,
          }
        : null,
    );
  }, [hasTarget, profileIds, groupIds, duration, pricing, note]);

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    if (!hasTarget || !onSubmit) return;
    await onSubmit({
      profile_ids: profileIds,
      group_ids: groupIds,
      duration,
      pricing,
      note: note.trim() || undefined,
    });
    setProfileIds([]);
    setGroupIds([]);
    setPricing({ mode: 'FREE' });
    setNote('');
  }

  const selectedCount = profileIds.length + groupIds.length;
  const blockedHint = !hasTarget
    ? t('accessGrants.pickTargetHint')
    : disabled
      ? (disabledHint ?? t('accessGrants.blockedHint'))
      : undefined;

  return (
    <div className="space-y-4">
      <AccessFormStep
        step={1}
        title={t('accessGrants.stepTargets')}
        hint={
          isTeacher ? t('accessGrants.stepTargetsTeacherHint') : t('accessGrants.stepTargetsHint')
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('accessGrants.students')}</Label>
            <EntityMultiSelect
              items={students}
              selected={profileIds}
              onChange={setProfileIds}
              granted={grantedStudentIds}
              onRevoke={onRevokeStudent}
              disabled={isLoading || isSaving}
              labels={{
                placeholder: t('accessGrants.selectStudents'),
                selected: t('accessGrants.students'),
                search: t('common.search'),
                empty: t('accessGrants.noStudents'),
                remove: t('common.remove'),
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
                remove: t('common.remove'),
              }}
            />
            <p className="text-xs text-muted-foreground">{t('accessGrants.groupsHint')}</p>
          </div>
        </div>
        {targetsFooter}
      </AccessFormStep>

      <AccessFormStep
        step={2}
        title={t('accessGrants.stepDuration')}
        hint={t('accessGrants.stepDurationHint')}
      >
        <AccessDurationPicker value={duration} onChange={setDuration} disabled={isSaving} />
      </AccessFormStep>

      {!isTeacher && (
        <AccessFormStep
          step={3}
          title={t('accessGrants.stepPricing')}
          hint={t('accessGrants.stepPricingHint')}
        >
          <AccessPricingPicker value={pricing} onChange={setPricing} disabled={isSaving} />

          {pricing.mode !== 'FREE' && groupIds.length > 0 && (
            <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
              {t('accessGrants.paidGroupWarning')}
            </p>
          )}
        </AccessFormStep>
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

      {onSelectionChange ? (
        selectedCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            {t('accessGrants.savedWithCourseHint', {
              students: String(profileIds.length),
              groups: String(groupIds.length),
            })}
          </p>
        ) : null
      ) : (
        <AssignAccessSubmit
          label={submitLabel ?? t('accessGrants.giveAccess')}
          blockedHint={blockedHint}
          readyHint={
            selectedCount > 0
              ? t('accessGrants.readyHint', {
                  students: String(profileIds.length),
                  groups: String(groupIds.length),
                })
              : undefined
          }
          isSaving={isSaving}
          onSubmit={() => void handleSubmit()}
        />
      )}
    </div>
  );
}
