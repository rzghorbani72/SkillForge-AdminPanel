'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  EntityMultiSelect,
  type SelectableEntity
} from '@/components/shared/entity-multi-select';
import { apiClient } from '@/lib/api';
import { studentGroupsApi } from '@/lib/api-extra';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

const COURSE_PAGE_SIZE = 100;

export type GrantMode = 'course' | 'lesson';

type GroupGrantDialogProps = {
  groupId: string | null;
  mode: GrantMode;
  onOpenChange: (open: boolean) => void;
  onGranted: () => void;
};

type CourseRecord = { id: string; title?: string | null };
type LessonRecord = { id: string; title?: string | null };

function toEntities(
  records: { id: string; title?: string | null }[]
): SelectableEntity[] {
  return records.map((record) => ({
    id: record.id,
    title: record.title || '—'
  }));
}

/**
 * Grants a group access to whole courses, or to individual lessons inside one
 * course. Lessons are always picked *within* a course because that is how the
 * server scopes them, and it keeps the list short enough to scan.
 */
export function GroupGrantDialog({
  groupId,
  mode,
  onOpenChange,
  onGranted
}: GroupGrantDialogProps) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<SelectableEntity[]>([]);
  const [lessons, setLessons] = useState<SelectableEntity[]>([]);
  const [courseId, setCourseId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = !!groupId;

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCourses({
        page: 1,
        limit: COURSE_PAGE_SIZE
      });
      setCourses(toEntities((data?.courses ?? []) as CourseRecord[]));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLessons = useCallback(async (selectedCourseId: string) => {
    setIsLoading(true);
    try {
      const data = (await apiClient.getLessons({
        course_id: selectedCourseId,
        limit: COURSE_PAGE_SIZE
      })) as LessonRecord[];
      setLessons(toEntities(Array.isArray(data) ? data : []));
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadCourses();
  }, [isOpen, loadCourses]);

  // Lessons only make sense once a course is chosen, and the previous course's
  // picks must not survive into the new one.
  useEffect(() => {
    if (mode !== 'lesson' || !courseId) {
      setLessons([]);
      return;
    }
    setSelected([]);
    loadLessons(courseId);
  }, [mode, courseId, loadLessons]);

  useEffect(() => {
    if (isOpen) return;
    setSelected([]);
    setCourseId('');
    setLessons([]);
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!groupId || selected.length === 0) return;

    setIsSaving(true);
    try {
      if (mode === 'course') {
        await studentGroupsApi.grantCourses(groupId, selected);
      } else {
        await studentGroupsApi.grantLessons(groupId, selected);
      }
      ErrorHandler.showSuccess(t('users.groupAccessGranted'));
      onOpenChange(false);
      onGranted();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }

  const items = mode === 'course' ? courses : lessons;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'course'
              ? t('users.grantCourseAccessTitle')
              : t('users.grantLessonAccessTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('users.grantAccessDescription')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'lesson' && (
            <div className="space-y-2">
              <Label>{t('users.selectCourseFirst')}</Label>
              <Select
                value={courseId}
                onValueChange={setCourseId}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('users.selectCoursePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : mode === 'lesson' && !courseId ? (
            <p className="rounded-lg border border-dashed border-border/70 py-4 text-center text-[12.5px] text-muted-foreground">
              {t('users.selectCourseFirst')}
            </p>
          ) : (
            <EntityMultiSelect
              items={items}
              selected={selected}
              onChange={setSelected}
              disabled={isSaving}
              labels={{
                placeholder:
                  mode === 'course'
                    ? t('users.selectCourses')
                    : t('users.selectLessons'),
                selected: t('common.selected'),
                search: t('common.search'),
                empty:
                  mode === 'course'
                    ? t('users.noCoursesAvailable')
                    : t('users.noLessonsAvailable'),
                remove: t('common.remove')
              }}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving || selected.length === 0}>
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('users.grantAccess')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
