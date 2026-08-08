'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Loader2, Plus, Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { studentGroupsApi, type StudentGroupDetail } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import { UserAvatar } from './user-avatar';
import { GroupStatCards } from './group-stat-cards';
import { GroupGrantDialog, type GrantMode } from './group-grant-dialog';
import { GroupAddMembersDialog } from './group-add-members-dialog';

type GroupDetailDialogProps = {
  groupId: string | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fa-IR');
}

function SectionTitle({
  icon: Icon,
  label,
  count,
  actionLabel,
  onAction
}: {
  icon: typeof Users;
  label: string;
  count: number;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-[14px] font-semibold">{label}</h3>
      <span className="font-mono text-[12px] text-muted-foreground">
        {count.toLocaleString('fa-IR')}
      </span>
      <button
        type="button"
        onClick={onAction}
        className="ms-auto flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Plus className="h-3 w-3" />
        {actionLabel}
      </button>
    </div>
  );
}

/** Shared row for a granted course/lesson, with its revoke control. */
function GrantRow({
  title,
  grantedAt,
  onRevoke,
  isRevoking,
  revokeLabel
}: {
  title: string;
  grantedAt: string;
  onRevoke: () => void;
  isRevoking: boolean;
  revokeLabel: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="min-w-0 flex-1 truncate text-[13px]">{title}</span>
      <span className="shrink-0 text-[11.5px] text-muted-foreground">
        {grantedAt}
      </span>
      <button
        type="button"
        title={revokeLabel}
        onClick={onRevoke}
        disabled={isRevoking}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-destructive disabled:opacity-50"
      >
        {isRevoking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </li>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border/70 py-4 text-center text-[12.5px] text-muted-foreground">
      {label}
    </p>
  );
}

export function GroupDetailDialog({
  groupId,
  onOpenChange,
  onChanged
}: GroupDetailDialogProps) {
  const { t } = useTranslation();
  const [group, setGroup] = useState<StudentGroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [grantMode, setGrantMode] = useState<GrantMode | null>(null);
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await studentGroupsApi.get(id);
      setGroup(response.data);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setGroup(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }
    load(groupId);
  }, [groupId, load]);

  /**
   * Every mutation here follows the same shape: run it, re-read the group, and
   * tell the card grid to re-read too (it shows member/course counts).
   */
  async function runMutation(key: string, action: () => Promise<unknown>) {
    if (!groupId) return;
    setRemovingId(key);
    try {
      await action();
      await load(groupId);
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setRemovingId(null);
    }
  }

  function reloadAfterDialog() {
    if (groupId) load(groupId);
    onChanged();
  }

  return (
    <>
      {/* The child dialogs are siblings, not children: nesting them inside this
          dialog puts them under its focus trap, where closing the inner one can
          take the outer one down with it. */}
      <Dialog open={!!groupId} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {isLoading || !group ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DialogHeader className="text-start">
                <div className="flex items-center gap-2">
                  <DialogTitle>{group.name}</DialogTitle>
                  <Badge variant={group.is_active ? 'default' : 'outline'}>
                    {group.is_active
                      ? t('common.active')
                      : t('common.inactive')}
                  </Badge>
                </div>
                <DialogDescription>
                  {group.description || t('users.groupNoDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-6">
                <GroupStatCards
                  members={group.Members.length}
                  courses={group.CourseGrants.length}
                  lessons={group.LessonGrants.length}
                />

                <p className="text-[11.5px] text-muted-foreground">
                  {t('users.groupCreatedAt')} {formatDate(group.created_at)}
                </p>

                <Separator />

                <section>
                  <SectionTitle
                    icon={Users}
                    label={t('users.groupMembers')}
                    count={group.Members.length}
                    actionLabel={t('common.add')}
                    onAction={() => setAddMembersOpen(true)}
                  />
                  {group.Members.length === 0 ? (
                    <EmptyHint label={t('users.groupNoMembers')} />
                  ) : (
                    <ul className="divide-y divide-border/60 rounded-lg border border-border">
                      {group.Members.map((member) => {
                        const displayName = member.Profile?.display_name || '—';
                        return (
                          <li
                            key={member.id}
                            className="flex items-center gap-2.5 px-3 py-2"
                          >
                            <UserAvatar
                              name={displayName}
                              tone={210}
                              size={26}
                            />
                            <Link
                              href={`/user/${member.profile_id}`}
                              className="min-w-0 flex-1 truncate text-[13px] font-medium hover:underline"
                            >
                              {displayName}
                            </Link>
                            <button
                              type="button"
                              title={t('users.removeFromGroup')}
                              onClick={() =>
                                runMutation(member.profile_id, () =>
                                  studentGroupsApi.removeMember(
                                    group.id,
                                    member.profile_id
                                  )
                                )
                              }
                              disabled={removingId === member.profile_id}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-destructive disabled:opacity-50"
                            >
                              {removingId === member.profile_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section>
                  <SectionTitle
                    icon={BookOpen}
                    label={t('users.groupCourseAccess')}
                    count={group.CourseGrants.length}
                    actionLabel={t('users.grantAccess')}
                    onAction={() => setGrantMode('course')}
                  />
                  {group.CourseGrants.length === 0 ? (
                    <EmptyHint label={t('users.groupNoCourseAccess')} />
                  ) : (
                    <ul className="divide-y divide-border/60 rounded-lg border border-border">
                      {group.CourseGrants.map((grant) => (
                        <GrantRow
                          key={grant.id}
                          title={grant.Course?.title || '—'}
                          grantedAt={formatDate(grant.granted_at)}
                          revokeLabel={t('users.revokeAccess')}
                          isRevoking={removingId === grant.id}
                          onRevoke={() =>
                            runMutation(grant.id, () =>
                              studentGroupsApi.revokeCourse(
                                group.id,
                                grant.course_id
                              )
                            )
                          }
                        />
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <SectionTitle
                    icon={GraduationCap}
                    label={t('users.groupLessonAccess')}
                    count={group.LessonGrants.length}
                    actionLabel={t('users.grantAccess')}
                    onAction={() => setGrantMode('lesson')}
                  />
                  {group.LessonGrants.length === 0 ? (
                    <EmptyHint label={t('users.groupNoLessonAccess')} />
                  ) : (
                    <ul className="divide-y divide-border/60 rounded-lg border border-border">
                      {group.LessonGrants.map((grant) => (
                        <GrantRow
                          key={grant.id}
                          title={grant.Lesson?.title || '—'}
                          grantedAt={formatDate(grant.granted_at)}
                          revokeLabel={t('users.revokeAccess')}
                          isRevoking={removingId === grant.id}
                          onRevoke={() =>
                            runMutation(grant.id, () =>
                              studentGroupsApi.revokeLesson(
                                group.id,
                                grant.lesson_id
                              )
                            )
                          }
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <GroupGrantDialog
        groupId={grantMode && group ? group.id : null}
        mode={grantMode ?? 'course'}
        onOpenChange={(open) => !open && setGrantMode(null)}
        onGranted={reloadAfterDialog}
      />
      <GroupAddMembersDialog
        groupId={addMembersOpen && group ? group.id : null}
        existingMemberIds={
          group?.Members.map((member) => member.profile_id) ?? []
        }
        onOpenChange={setAddMembersOpen}
        onAdded={reloadAfterDialog}
      />
    </>
  );
}
