import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CourseOffering, CourseOfferingInput } from '@/types/api';
import { toast } from 'react-toastify';

// Manages the offerings of ONE course: a course can be sold via several
// offerings at once (one-time / subscription / private / free).
export function useCourseOfferings(courseId: string | undefined) {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      setOfferings(await apiClient.getCourseOfferings(courseId));
    } catch {
      setOfferings([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: Omit<CourseOfferingInput, 'course_id'>) => {
      if (!courseId) return;
      setIsSaving(true);
      try {
        await apiClient.createCourseOffering({ ...input, course_id: courseId });
        await refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to add offering');
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, refresh]
  );

  const toggleActive = useCallback(
    async (offering: CourseOffering) => {
      setIsSaving(true);
      try {
        await apiClient.updateCourseOffering(offering.id, {
          is_active: !offering.is_active
        });
        await refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'Failed to update offering'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setIsSaving(true);
      try {
        await apiClient.deleteCourseOffering(id);
        await refresh();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : 'Failed to delete offering'
        );
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  return {
    offerings,
    isLoading,
    isSaving,
    refresh,
    create,
    toggleActive,
    remove
  };
}
