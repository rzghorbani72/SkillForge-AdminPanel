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
import { Textarea } from '@/components/ui/textarea';
import {
  EntityMultiSelect,
  type SelectableEntity
} from '@/components/shared/entity-multi-select';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';

const COURSE_PAGE_SIZE = 100;

type GrantCourseDialogProps = {
  /** Profile id of the student receiving free access; null closes the dialog. */
  profileId: string | null;
  onOpenChange: (open: boolean) => void;
  onGranted: () => void;
};

type CourseRecord = { id: string; title?: string | null };

/**
 * Gives ONE student free access to courses — the single-student twin of the
 * group course grant. Courses are picked by title; the previous UI asked the
 * manager to type a raw course id into window.prompt().
 */
export function GrantCourseDialog({
  profileId,
  onOpenChange,
  onGranted
}: GrantCourseDialogProps) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<SelectableEntity[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = !!profileId;

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCourses({
        page: 1,
        limit: COURSE_PAGE_SIZE
      });
      const records = (data?.courses ?? []) as CourseRecord[];
      setCourses(
        records.map((course) => ({
          id: course.id,
          title: course.title || '—'
        }))
      );
    } catch (error) {
      ErrorHandler.handleApiError(error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadCourses();
  }, [isOpen, loadCourses]);

  useEffect(() => {
    if (isOpen) return;
    setSelected([]);
    setNote('');
  }, [isOpen]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profileId || selected.length === 0) return;

    setIsSaving(true);
    try {
      // One call per course: the endpoint grants a single course at a time.
      for (const courseId of selected) {
        await apiClient.grantCourseAccess(profileId, {
          course_id: courseId,
          note: note.trim() || undefined
        });
      }
      ErrorHandler.showSuccess(t('users.courseAccessGranted'));
      onOpenChange(false);
      onGranted();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('users.grantCourse')}</DialogTitle>
          <DialogDescription>
            {t('users.grantCourseDescription')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EntityMultiSelect
              items={courses}
              selected={selected}
              onChange={setSelected}
              disabled={isSaving}
              labels={{
                placeholder: t('users.selectCourses'),
                selected: t('common.selected'),
                search: t('common.search'),
                empty: t('users.noCoursesAvailable'),
                remove: t('common.remove')
              }}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="grant-note">{t('users.grantNote')}</Label>
            <Textarea
              id="grant-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('users.grantNotePlaceholder')}
              disabled={isSaving}
            />
          </div>

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
