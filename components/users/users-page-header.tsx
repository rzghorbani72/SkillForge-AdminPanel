'use client';

import { useState } from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssignAccessDialog } from '@/components/access/assign-access-dialog';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { useTranslation } from '@/lib/i18n/hooks';

interface UsersPageHeaderProps {
  /** Reload the list and the header counts after someone is added. */
  onChanged: () => void;
}

export function UsersPageHeader({ onChanged }: UsersPageHeaderProps) {
  const { t } = useTranslation();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [assignAccessOpen, setAssignAccessOpen] = useState(false);

  return (
    <>
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={onChanged}
      />
      <AssignAccessDialog
        open={assignAccessOpen}
        onOpenChange={setAssignAccessOpen}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {t('users.people')}
          </div>
          <h1 className="text-[24px] font-bold leading-none tracking-tight">
            {t('users.users')}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {t('users.pageDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAssignAccessOpen(true)}
          >
            <KeyRound className="h-3.5 w-3.5" /> {t('accessGrants.giveAccess')}
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> {t('users.addUser')}
          </Button>
        </div>
      </div>
    </>
  );
}
