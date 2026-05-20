'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ErrorHandler } from '@/lib/error-handler';
import { studentGroupsApi } from '@/lib/api-extra';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';

type UserCard = {
  id: number;
  display_name?: string;
  role?: string;
  User?: { email?: string; phone_number?: string };
};

type StudentGroup = {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  _count?: { Members: number; CourseGrants: number; LessonGrants: number };
};

const API_BASE = getBrowserApiBaseUrl();

async function fetchUsers(role: 'STUDENT' | 'TEACHER'): Promise<UserCard[]> {
  const path = role === 'STUDENT' ? '/users/students' : '/users/teachers';
  const res = await fetch(`${API_BASE}${path}?limit=50`, {
    credentials: 'include'
  });
  if (!res.ok) return [];
  const body = await res.json();
  const list = body?.data?.data ?? body?.data?.profiles ?? body?.data ?? body;
  return Array.isArray(list) ? list : [];
}

export default function UsersPage() {
  const [students, setStudents] = useState<UserCard[]>([]);
  const [teachers, setTeachers] = useState<UserCard[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [busyGroupId, setBusyGroupId] = useState<number | null>(null);
  const [memberDraft, setMemberDraft] = useState<Record<number, string>>({});
  const [courseDraft, setCourseDraft] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, g] = await Promise.all([
        fetchUsers('STUDENT'),
        fetchUsers('TEACHER'),
        studentGroupsApi.list()
      ]);
      setStudents(s);
      setTeachers(t);
      setGroups((g?.data ?? []) as StudentGroup[]);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      await studentGroupsApi.create({ name });
      setNewGroupName('');
      ErrorHandler.showSuccess('Group created');
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  };

  const deleteGroup = async (id: number) => {
    if (!confirm('Delete this group? Existing members lose group access.'))
      return;
    setBusyGroupId(id);
    try {
      await studentGroupsApi.remove(id);
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusyGroupId(null);
    }
  };

  const parseIdList = (raw: string): number[] =>
    raw
      .split(/[\s,]+/)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);

  const addMembers = async (id: number) => {
    const ids = parseIdList(memberDraft[id] ?? '');
    if (ids.length === 0) {
      ErrorHandler.showWarning('Enter one or more profile IDs');
      return;
    }
    setBusyGroupId(id);
    try {
      await studentGroupsApi.addMembers(id, ids);
      setMemberDraft((m) => ({ ...m, [id]: '' }));
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusyGroupId(null);
    }
  };

  const grantCourses = async (id: number) => {
    const ids = parseIdList(courseDraft[id] ?? '');
    if (ids.length === 0) {
      ErrorHandler.showWarning('Enter one or more course IDs');
      return;
    }
    setBusyGroupId(id);
    try {
      await studentGroupsApi.grantCourses(id, ids);
      setCourseDraft((m) => ({ ...m, [id]: '' }));
      await load();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setBusyGroupId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage students, teachers, and access groups for your academy.
        </p>
      </header>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Students{' '}
                <span className="text-muted-foreground">
                  ({students.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No students yet.
                </p>
              ) : (
                students.map((s) => <UserRow key={s.id} u={s} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Teachers{' '}
                <span className="text-muted-foreground">
                  ({teachers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teachers.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No teachers yet.
                </p>
              ) : (
                teachers.map((t) => <UserRow key={t.id} u={t} />)
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student groups</CardTitle>
          <p className="text-xs text-muted-foreground">
            Group students to bulk-grant course or lesson access. Useful for
            subscription-plan invites, classroom cohorts, or beta groups.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={createGroup} disabled={!newGroupName.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Create group
            </Button>
          </div>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No groups yet.</p>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <details
                  key={g.id}
                  className="rounded-md border border-border/60 bg-card/30"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {g._count?.Members ?? 0} members ·{' '}
                        {g._count?.CourseGrants ?? 0} courses
                        {g.is_active ? '' : ' · inactive'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteGroup(g.id);
                      }}
                      disabled={busyGroupId === g.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </summary>
                  <div className="space-y-4 px-4 pb-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Add members by profile id
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. 12 18 24"
                          value={memberDraft[g.id] ?? ''}
                          onChange={(e) =>
                            setMemberDraft((m) => ({
                              ...m,
                              [g.id]: e.target.value
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => addMembers(g.id)}
                          disabled={busyGroupId === g.id}
                        >
                          <UserPlus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Grant course access by course id
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. 3 7 11"
                          value={courseDraft[g.id] ?? ''}
                          onChange={(e) =>
                            setCourseDraft((m) => ({
                              ...m,
                              [g.id]: e.target.value
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => grantCourses(g.id)}
                          disabled={busyGroupId === g.id}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Grant
                        </Button>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ u }: { u: UserCard }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/40 bg-background/40 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {u.display_name || `Profile #${u.id}`}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {u.User?.email || u.User?.phone_number || '—'}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        ID {u.id}
        {u.role ? ` · ${u.role}` : ''}
      </span>
    </div>
  );
}
