import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { toast } from 'react-toastify';
import { tNow } from '@/lib/i18n/t-now';

export type CourseWithRevenue = Course & {
  revenue: number;
  enrollments_count: number;
};

const useCourses = () => {
  const router = useRouter();
  const { selectedAcademy } = useStore();

  const [rawCourses, setRawCourses] = useState<Course[]>([]);
  const [revenueMap, setRevenueMap] = useState<Record<string, number>>({});
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingFilter, setPricingFilter] = useState('ALL');

  const fetchRevenue = useCallback(async () => {
    try {
      const data = (await apiClient.getPayments({
        status: 'PAID',
        limit: 500,
        academy_id: selectedAcademy?.id
      })) as any;
      const payments: any[] = Array.isArray(data)
        ? data
        : (data?.payments ?? data?.data ?? []);
      const rMap: Record<string, number> = {};
      const eMap: Record<string, number> = {};
      for (const p of payments) {
        const cid = p.course_id ?? p.course?.id ?? p.Course?.id;
        if (cid) {
          rMap[cid] = (rMap[cid] ?? 0) + (p.amount ?? 0);
          eMap[cid] = (eMap[cid] ?? 0) + 1;
        }
      }
      setRevenueMap(rMap);
      setEnrollmentMap(eMap);
    } catch {
      // Revenue optional — don't block list
    }
  }, [selectedAcademy]);

  const fetchCourses = useCallback(async () => {
    if (!selectedAcademy) return;
    try {
      setIsLoading(true);
      const response = await apiClient.getCourses({
        page: 1,
        limit: 100,
        academy_id: selectedAcademy.id
      });
      let list: Course[] = [];
      if (Array.isArray(response)) list = response;
      else if (Array.isArray(response?.courses)) list = response.courses;
      // filter to current academy
      list = list.filter((c) =>
        (c as any).academy_id
          ? (c as any).academy_id === selectedAcademy.id
          : true
      );
      setRawCourses(list);
    } catch (err: any) {
      toast.error(tNow('toasts.coursesLoadFailed'));
      setRawCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademy]);

  useEffect(() => {
    if (selectedAcademy) {
      fetchCourses();
      fetchRevenue();
    }
  }, [selectedAcademy, fetchCourses, fetchRevenue]);

  const totalCourses = rawCourses.length;

  const courses: CourseWithRevenue[] = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rawCourses
      .filter((c) => {
        const matchesSearch =
          !term ||
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          (c as any).slug?.toLowerCase().includes(term) ||
          (c as any).category?.name?.toLowerCase().includes(term);
        const matchesPricing =
          pricingFilter === 'ALL' || (c as any).pricing_type === pricingFilter;
        return matchesSearch && matchesPricing;
      })
      .map((c) => ({
        ...c,
        revenue: revenueMap[c.id] ?? 0,
        enrollments_count: enrollmentMap[c.id] ?? (c as any).students_count ?? 0
      }));
  }, [rawCourses, revenueMap, enrollmentMap, searchTerm, pricingFilter]);

  const handleViewCourse = (course: CourseWithRevenue) =>
    router.push(`/courses/${course.id}`);
  const handleEditCourse = (course: CourseWithRevenue) =>
    router.push(`/courses/${course.id}/edit`);

  const handleDeleteCourse = async (course: CourseWithRevenue) => {
    try {
      await apiClient.deleteCourse(course.id);
      toast.success(tNow('toasts.courseDeleted'));
      fetchCourses();
    } catch (err: unknown) {
      // Localizes COURSE_HAS_ACTIVE_ENROLLMENTS and friends by error code.
      ErrorHandler.handleApiError(err);
    }
  };

  const refresh = () => {
    fetchCourses();
    fetchRevenue();
  };

  return {
    courses,
    totalCourses,
    isLoading,
    searchTerm,
    setSearchTerm,
    pricingFilter,
    setPricingFilter,
    handleViewCourse,
    handleEditCourse,
    handleDeleteCourse,
    refresh,
    fetchCourses
  };
};

export default useCourses;
