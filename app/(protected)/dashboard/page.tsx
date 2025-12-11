'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import ContentCreationHub from '@/components/content/content-creation-hub';
import useDashboard from '@/components/dashboard/useDashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentLists from '@/components/dashboard/RecentLists';
import RevenueChart from '@/components/dashboard/RevenueChart';
import EnrollmentsChart from '@/components/dashboard/EnrollmentsChart';
import CoursePerformanceChart from '@/components/dashboard/CoursePerformanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';
import Link from 'next/link';

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const { user } = useAuthUser();
  const store = useCurrentStore();
  const {
    isLoading,
    recentCourses,
    recentEnrollments,
    recentPayments,
    recentActivity,
    statsCards,
    statsTotals,
    monthlyChartData,
    coursePerformanceData
  } = useDashboard();

  const { userState, isLoading: userLoading } = useAccessControl();

  // Check if user is admin without a store
  const isAdminWithoutStore =
    user &&
    user.role === 'ADMIN' &&
    (user.storeId === null || user.storeId === undefined);
  const effectiveStore = isAdminWithoutStore ? null : store;

  // Calculate monthly statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Calculate actual revenue from payments this month
  const currentRevenue = recentPayments
    .filter((p) => {
      if (p.status !== 'COMPLETED') return false;
      if (!p.payment_date) return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= startOfMonth;
    })
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  // Calculate revenue from last month to set target (110% of last month)
  const lastMonthRevenue = recentPayments
    .filter((p) => {
      if (p.status !== 'COMPLETED') return false;
      if (!p.payment_date) return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= startOfLastMonth && paymentDate <= endOfLastMonth;
    })
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const revenueTarget =
    lastMonthRevenue > 0
      ? Math.round(lastMonthRevenue * 1.1)
      : currentRevenue > 0
        ? Math.round(currentRevenue * 1.5)
        : 7500000;

  const coursesThisMonth = recentCourses.filter((course) => {
    if (!course.created_at) return false;
    const createdDate = new Date(course.created_at);
    return createdDate >= startOfMonth;
  }).length;

  const totalCourses = statsTotals?.totalCourses || recentCourses.length;
  const courseCreationTarget = Math.max(5, Math.ceil(totalCourses * 0.1));
  const courseCreationProgress =
    courseCreationTarget > 0
      ? Math.min((coursesThisMonth / courseCreationTarget) * 100, 100)
      : 0;

  const enrollmentsThisMonth = recentEnrollments.filter((enrollment) => {
    if (!enrollment.enrolled_at) return false;
    const enrolledDate = new Date(enrollment.enrolled_at);
    return enrolledDate >= startOfMonth;
  }).length;

  const totalActiveEnrollments =
    statsTotals?.activeEnrollments || recentEnrollments.length;
  const enrollmentTarget = Math.max(
    100,
    Math.ceil(totalActiveEnrollments * 0.2)
  );
  const enrollmentProgress =
    enrollmentTarget > 0
      ? Math.min((enrollmentsThisMonth / enrollmentTarget) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary">
                <Sparkles className="h-8 w-8 animate-pulse text-white" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {t('dashboard.loadingDashboardData')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('dashboard.title')}
            </h1>
            <Badge variant="secondary" className="hidden sm:flex">
              <Sparkles className="mr-1 h-3 w-3" />
              {t('dashboard.live')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('dashboard.welcomeBack')} {t('dashboard.whatsHappening')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString(
              language === 'fa' ? 'fa-IR' : 'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }
            )}
          </Button>
          <ContentCreationHub
            onContentCreated={() => {
              window.location.reload();
            }}
            courses={recentCourses}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards cards={statsCards} />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        <RevenueChart data={monthlyChartData} />
        <EnrollmentsChart data={monthlyChartData} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Activity */}
        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                {t('dashboard.recentActivity')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.recentActivityDescription')}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-muted p-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t('common.noData')}
                  </p>
                </div>
              ) : (
                recentActivity.slice(0, 6).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                      <AvatarFallback
                        className={
                          activity.type === 'course_created'
                            ? 'bg-violet-500/10 text-violet-600'
                            : activity.type === 'student_enrolled'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                        }
                      >
                        {activity.user
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .substring(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <QuickActions />
        </div>

        {/* Monthly Goals */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              {t('dashboard.monthlyGoals')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.progressTowardsTargets')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Creation Goal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <BookOpen className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {t('dashboard.courseCreation')}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {coursesThisMonth}/{courseCreationTarget}
                </span>
              </div>
              <Progress
                value={courseCreationProgress}
                className="h-2 bg-violet-100 dark:bg-violet-950"
              />
            </div>

            {/* Enrollment Goal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {t('dashboard.studentEnrollment')}
                  </span>
                </div>
                <span className="text-sm font-bold">
                  {enrollmentsThisMonth.toLocaleString()}/
                  {enrollmentTarget.toLocaleString()}
                </span>
              </div>
              <Progress
                value={enrollmentProgress}
                className="h-2 bg-emerald-100 dark:bg-emerald-950"
              />
            </div>

            {/* Revenue Goal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {t('dashboard.revenueTarget')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatCurrencyWithStore(
                    currentRevenue,
                    effectiveStore,
                    undefined,
                    language
                  )}
                </span>
                <span>
                  {formatCurrencyWithStore(
                    revenueTarget,
                    effectiveStore,
                    undefined,
                    language
                  )}
                </span>
              </div>
              <Progress
                value={
                  revenueTarget > 0
                    ? Math.min((currentRevenue / revenueTarget) * 100, 100)
                    : 0
                }
                className="h-2 bg-amber-100 dark:bg-amber-950"
              />
            </div>

            {/* View Details Link */}
            <Link
              href="/analytics"
              className="flex items-center justify-center gap-1 pt-2 text-sm text-primary hover:underline"
            >
              {t('dashboard.viewAnalytics')}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Chart */}
      <div className="grid gap-6 lg:grid-cols-7">
        <CoursePerformanceChart data={coursePerformanceData} />

        {/* Top Courses */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                {t('dashboard.topCourses')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.bestSellingCourses')}
              </CardDescription>
            </div>
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                {t('common.viewAll')}
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.slice(0, 5).map((course, index) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold ${
                      index === 0
                        ? 'bg-amber-500 text-white'
                        : index === 1
                          ? 'bg-slate-400 text-white'
                          : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium group-hover:text-primary">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>
                        {course.students_count} {t('dashboard.students')}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={course.is_published ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {course.is_published
                      ? t('dashboard.published')
                      : t('dashboard.draft')}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lists Section */}
      <RecentLists
        courses={recentCourses}
        enrollments={recentEnrollments}
        payments={recentPayments}
      />
    </div>
  );
}
