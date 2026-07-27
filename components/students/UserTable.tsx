'use client';

import { useMemo } from 'react';
import { CheckCircle, ExternalLink, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataList, type DataColumn } from '@/components/shared/data-list';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserStatusPill } from '@/components/users/user-status-pill';
import {
  UserCard,
  getUserStatus,
  userTone
} from '@/components/users/user-card';
import type { InterpolationParams } from '@/lib/i18n';
import type { User } from '@/types/api';

interface UserTableProps {
  users: User[];
  emptyMessage: string;
  t: (key: string, params?: InterpolationParams) => string;
  showWorkspace?: boolean;
}

function VerifiedMark({
  verified,
  label
}: {
  verified: boolean;
  label: string;
}) {
  return (
    <span title={label} className="shrink-0">
      {verified ? (
        <CheckCircle className="h-3.5 w-3.5 text-success" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
      )}
    </span>
  );
}

export function UserTable({
  users,
  emptyMessage,
  t,
  showWorkspace
}: UserTableProps) {
  const columns = useMemo<DataColumn<User>[]>(
    () => [
      {
        id: 'user',
        header: t('students.studentName'),
        cell: (user) => (
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={user.display_name || user.name}
              tone={userTone(user)}
            />
            <span className="truncate font-semibold">
              {user.display_name || user.name}
            </span>
          </div>
        )
      },
      {
        id: 'email',
        header: t('students.email'),
        className: 'hidden md:table-cell',
        cell: (user) =>
          user.email ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="truncate">{user.email}</span>
              <VerifiedMark
                verified={user.email_confirmed}
                label={t('common.email')}
              />
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )
      },
      {
        id: 'phone',
        header: t('students.phone'),
        className: 'hidden sm:table-cell',
        cell: (user) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span dir="ltr">{user.phone_number || '—'}</span>
            <VerifiedMark
              verified={user.phone_confirmed}
              label={t('common.phone')}
            />
          </span>
        )
      },
      {
        id: 'status',
        header: t('common.status'),
        cell: (user) => <UserStatusPill status={getUserStatus(user)} />
      },
      ...(showWorkspace
        ? [
            {
              id: 'workspace',
              header: t('learningOperations.workspace'),
              align: 'end' as const,
              cell: (user: User) => (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg text-xs"
                >
                  <Link href={`/students/${user.id}`}>
                    {t('learningOperations.openWorkspace')}
                    <ExternalLink className="ms-1.5 h-3 w-3" />
                  </Link>
                </Button>
              )
            }
          ]
        : [])
    ],
    [t, showWorkspace]
  );

  return (
    <DataList
      items={users}
      columns={columns}
      rowKey={(user) => user.id}
      renderCard={(user) => (
        <UserCard
          user={user}
          actions={
            showWorkspace ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex-1 rounded-lg"
              >
                <Link href={`/students/${user.id}`}>
                  {t('learningOperations.openWorkspace')}
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}
      emptyState={
        <div className="py-12">
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title={t('students.noUsersFound')}
            description={emptyMessage}
          />
        </div>
      }
    />
  );
}
