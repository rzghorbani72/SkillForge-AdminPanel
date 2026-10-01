'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/shared/Pagination';
import {
  CourseSearchCombobox,
  LessonSearchCombobox,
  StudentProfileSearchCombobox,
} from '@/components/entity-search';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Lock, LockOpen, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import type { PageMeta, StudentLessonAccessRecord } from '@/lib/api-client/types-3';

export default function StudentLessonAccessPage() {
  const { t } = useTranslation();
  const [list, setList] = useState<StudentLessonAccessRecord[]>([]);
  const [pagination, setPagination] = useState<PageMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [profileIdFilter, setProfileIdFilter] = useState('');

  const [dialog, setDialog] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(profileIdFilter ? { profile_id: profileIdFilter } : {}),
      };
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
        profile_id: profileId,
        lesson_id: lessonId,
        is_unlocked: isUnlocked,
        note: note || undefined,
      });
      setDialog(false);
      setProfileId('');
      setCourseId('');
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

  const handleDelete = async (id: string) => {
    if (!confirm(t('students.lessonAccess.removeConfirm'))) return;
    try {
      await apiClient.deleteStudentLessonAccess(id);
      fetchList();
    } catch (e) {
      ErrorHandler.handleApiError(e);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6" dir={'rtl'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('students.lessonAccess.title')}</h1>
          <p className="text-muted-foreground">{t('students.lessonAccess.description')}</p>
        </div>
        <Button onClick={() => setDialog(true)}>
          <Plus className="me-2 h-4 w-4" /> {t('students.lessonAccess.addOverride')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('students.lessonAccess.accessOverrides')}</CardTitle>
          <CardDescription>{t('students.lessonAccess.accessOverridesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative max-w-xs flex-1 space-y-2">
              <Label>{t('students.lessonAccess.filterByProfileId')}</Label>
              <StudentProfileSearchCombobox
                value={profileIdFilter}
                onValueChange={(value) => {
                  setProfileIdFilter(value);
                  setCurrentPage(1);
                }}
                placeholder={t('entitySearch.searchPlaceholder')}
                clearable
              />
            </div>
          </div>

          <div className="table-h-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('students.lessonAccess.student')}</TableHead>
                  <TableHead>{t('students.lessonAccess.lesson')}</TableHead>
                  <TableHead>{t('students.lessonAccess.access')}</TableHead>
                  <TableHead>{t('students.lessonAccess.note')}</TableHead>
                  <TableHead>{t('students.lessonAccess.setBy')}</TableHead>
                  <TableHead>{t('students.lessonAccess.updated')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      {t('students.lessonAccess.noOverridesYet')}
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
                            <LockOpen className="me-1 h-3 w-3" />{' '}
                            {t('students.lessonAccess.unlocked')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <Lock className="me-1 h-3 w-3" /> {t('students.lessonAccess.locked')}
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

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('students.lessonAccess.addOverrideTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pid">{t('students.lessonAccess.studentProfileId')}</Label>
              <StudentProfileSearchCombobox
                id="pid"
                value={profileId}
                onValueChange={setProfileId}
                placeholder={t('entitySearch.searchPlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('students.manualEnroll.courseId')}</Label>
              <CourseSearchCombobox
                value={courseId}
                onValueChange={(value) => {
                  setCourseId(value);
                  setLessonId('');
                }}
                placeholder={t('entitySearch.searchPlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lid">{t('students.lessonAccess.lessonId')}</Label>
              <LessonSearchCombobox
                id="lid"
                courseId={courseId}
                value={lessonId}
                onValueChange={setLessonId}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="text-sm font-medium">
                  {isUnlocked
                    ? t('students.lessonAccess.unlockLesson')
                    : t('students.lessonAccess.lockLesson')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isUnlocked
                    ? t('students.lessonAccess.unlockHelp')
                    : t('students.lessonAccess.lockHelp')}
                </p>
              </div>
              <Switch checked={isUnlocked} onCheckedChange={setIsUnlocked} />
            </div>
            <div>
              <Label htmlFor="note">{t('students.lessonAccess.internalNote')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !profileId || !lessonId}>
              {isSaving
                ? t('students.lessonAccess.saving')
                : t('students.lessonAccess.saveOverride')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
