'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Note } from '@/components/shared/note';
import { SectionCard } from '@/components/shared/section-card';
import { EntityMultiSelect } from '@/components/shared/entity-multi-select';
import { useAccessTargets } from '@/components/access/use-access-targets';
import { GroupRosterCard } from '@/components/class/group-roster-card';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroup } from '@/types/learning-operations';
import { useClassMembers } from './use-class-members';

/** Hands a free seat in the class to students the academy already has. */
export function StepClassMembers({ group }: { group: TutoringGroup | null }) {
  const { t } = useTranslation();
  const { students, isLoading } = useAccessTargets(Boolean(group));
  const { members, memberIds, busy, add, remove } = useClassMembers(group?.id ?? null);
  const [picked, setPicked] = useState<string[]>([]);

  if (!group) return <Note tone="warn">{t('liveWizard.membersNeedClass')}</Note>;

  const addPicked = async () => {
    await add(picked);
    setPicked([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={UserPlus}
        title={t('liveWizard.membersTitle')}
        hint={t('liveWizard.membersHint')}
      >
        <EntityMultiSelect
          items={students}
          selected={picked}
          onChange={setPicked}
          granted={memberIds}
          disabled={isLoading || busy}
          labels={{
            placeholder: t('accessGrants.selectStudents'),
            selected: t('accessGrants.students'),
            search: t('common.search'),
            empty: t('accessGrants.noStudents'),
            remove: t('common.remove'),
          }}
        />
        <Button
          type="button"
          className="self-start"
          disabled={picked.length === 0 || busy}
          onClick={() => void addPicked()}
        >
          {t('liveWizard.membersAdd')}
        </Button>
      </SectionCard>
      <GroupRosterCard members={members} busy={busy} onRemove={(id) => void remove(id)} />
    </div>
  );
}
