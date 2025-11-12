'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsData } from '../_hooks/use-analytics-data';

interface CoursePerformance {
  name: string;
  enrollments: number;
  revenue: number;
  completion: number;
  activeLearners: number;
}

export default function CoursePerformancePage() {
  const { courses, enrollments, payments, isLoading } = useAnalyticsData();

  const courseMetrics = useMemo<CoursePerformance[]>(() => {
    if (courses.length === 0) return [];

    const enrollmentsByCourse = new Map<number, number>();
    const completionByCourse = new Map<number, number>();
    const revenueByCourse = new Map<number, number>();

    enrollments.forEach((enrollment) => {
      const courseId = enrollment.course_id;
      if (!courseId) return;

      enrollmentsByCourse.set(
        courseId,
        (enrollmentsByCourse.get(courseId) ?? 0) + 1
      );

      if (enrollment.status === 'COMPLETED') {
        completionByCourse.set(
          courseId,
          (completionByCourse.get(courseId) ?? 0) + 1
        );
      }

      const paymentTotal =
        enrollment.payments?.reduce(
          (sum, payment) => sum + (payment.amount ?? 0),
          0
        ) ?? 0;
      revenueByCourse.set(
        courseId,
        (revenueByCourse.get(courseId) ?? 0) + paymentTotal
      );
    });

    payments.forEach((payment) => {
      if (!payment.course_id) return;
      revenueByCourse.set(
        payment.course_id,
        (revenueByCourse.get(payment.course_id) ?? 0) + (payment.amount ?? 0)
      );
    });

    return courses.map((course) => {
      const totalEnrollments = enrollmentsByCourse.get(course.id) ?? 0;
      const completedEnrollments = completionByCourse.get(course.id) ?? 0;
      const revenue = revenueByCourse.get(course.id) ?? 0;
      const activeLearners = enrollments.filter(
        (enrollment) =>
          enrollment.course_id === course.id && enrollment.status === 'ACTIVE'
      ).length;

      const completionRate =
        totalEnrollments > 0
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0;

      return {
        name: course.title,
        enrollments: totalEnrollments,
        revenue,
        completion: completionRate,
        activeLearners
      };
    });
  }, [courses, enrollments, payments]);

  const topByEnrollment = useMemo(
    () => [...courseMetrics].sort((a, b) => b.enrollments - a.enrollments),
    [courseMetrics]
  );

  const topByRevenue = useMemo(
    () => [...courseMetrics].sort((a, b) => b.revenue - a.revenue),
    [courseMetrics]
  );

  const aggregateTrend = useMemo(() => {
    if (enrollments.length === 0) return [];

    const map = new Map<
      string,
      { month: string; active: number; completed: number }
    >();

    enrollments.forEach((enrollment) => {
      const date = new Date(enrollment.enrolled_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = `${date.toLocaleString('en-US', { month: 'short' })} ${String(
        date.getFullYear()
      ).slice(-2)}`;

      if (!map.has(key)) {
        map.set(key, { month: label, active: 0, completed: 0 });
      }
      const bucket = map.get(key)!;
      if (enrollment.status === 'COMPLETED') {
        bucket.completed += 1;
      } else {
        bucket.active += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      const yearDiff = Number(yearA) - Number(yearB);
      if (yearDiff !== 0) return yearDiff;
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
  }, [enrollments]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading course analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Course Performance
        </h1>
        <p className="text-muted-foreground">
          Understand which courses attract the most students and deliver the
          highest revenue.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active vs Completed Enrolments</CardTitle>
          <CardDescription>
            Trend of learner activity across recent months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={aggregateTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="active"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f144"
                name="Active"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e44"
                name="Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Courses by Enrolments</CardTitle>
            <CardDescription>
              Most popular courses among your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topByEnrollment.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {topByEnrollment.slice(0, 8).map((course) => (
                <div
                  key={course.name}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{course.name}</span>
                  <Badge variant="outline">{course.enrollments} students</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Leaderboard</CardTitle>
            <CardDescription>
              Courses with the highest payment totals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topByRevenue.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(value / 100)
                  }
                />
                <Bar dataKey="revenue" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              {topByRevenue.slice(0, 8).map((course) => (
                <div key={course.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{course.name}</span>
                    <Badge variant="secondary">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(course.revenue / 100)}
                    </Badge>
                  </div>
                  <Progress value={course.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
