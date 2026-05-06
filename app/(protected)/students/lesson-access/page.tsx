'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Lock, LockOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface AccessRecord {
  id: number;
  is_unlocked: boolean;
  note?: string;
  updated_at: string;
  Profile?: { id: number; display_name: string };
  Lesson?: {
    id: number;
    title: string;
    Season?: { id: number; course_id: number };
  };
  UnlockedBy?: { id: number; display_name: string };
}

export default function StudentLessonAccessPage() {
  const { language } = useTranslation();
  const isRtl = language === 'fa' || language === 'ar';

  const [list, setList] = useState<AccessRecord[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [profileIdFilter, setProfileIdFilter] = useState('');

  // Dialog state
  const [dialog, setDialog] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = { page: currentPage, limit: 20 };
      if (profileIdFilter) params.profile_id = Number(profileIdFilter);
      const data = await apiClient.getStudentLessonAccess(params);
      setList(data?.list ?? []);
      setPagination(data?.pagination ?? null);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, profileIdFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSave = async () => {
    if (!profileId || !lessonId) return;
    try {
      setIsSaving(true);
      await apiClient.upsertStudentLessonAccess({
        profile_id: Number(profileId),
        lesson_id: Number(lessonId),
        is_unlocked: isUnlocked,
        note: note || undefined
      });
      setDialog(false);
      setProfileId('');
      setLessonId('');
      setNote('');
      setIsUnlocked(true);
      fetchList();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this access override?')) return;
    try {
      await apiClient.deleteStudentLessonAccess(id);
      fetchList();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Lesson Access
          </h1>
          <p className="text-muted-foreground">
            Lock or unlock specific lessons for individual students, independent
            of course publish state
          </p>
        </div>
        <Button onClick={() => setDialog(true)}>
          <Plus className="me-2 h-4 w-4" /> Add Override
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Overrides</CardTitle>
          <CardDescription>
            These rules override the lesson's default published/unpublished
            state for specific students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by profile ID..."
                value={profileIdFilter}
                onChange={(e) => {
                  setProfileIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="ps-8"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Set By</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900" />
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No access overrides yet. All students follow default
                      lesson publish state.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.Profile?.display_name ?? `#${item.Profile?.id}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.Lesson?.title ?? `#${item.Lesson?.id}`}
                      </TableCell>
                      <TableCell>
                        {item.is_unlocked ? (
                          <Badge className="bg-green-100 text-green-800">
                            <LockOpen className="me-1 h-3 w-3" /> Unlocked
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <Lock className="me-1 h-3 w-3" /> Locked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {item.note ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.UnlockedBy?.display_name ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onPageChange={setCurrentPage}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Override Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lesson Access Override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pid">Student Profile ID</Label>
              <Input
                id="pid"
                type="number"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                placeholder="e.g. 42"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lid">Lesson ID</Label>
              <Input
                id="lid"
                type="number"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                placeholder="e.g. 15"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="text-sm font-medium">
                  {isUnlocked ? 'Unlock this lesson' : 'Lock this lesson'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUnlocked
                    ? 'Student can access even if lesson is unpublished'
                    : 'Student cannot access even if lesson is published'}
                </p>
              </div>
              <Switch checked={isUnlocked} onCheckedChange={setIsUnlocked} />
            </div>
            <div>
              <Label htmlFor="note">Internal Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. VIP access, makeup session"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !profileId || !lessonId}
            >
              {isSaving ? 'Saving...' : 'Save Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
