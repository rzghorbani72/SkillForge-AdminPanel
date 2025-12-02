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
import { Calendar } from 'lucide-react';
import ContentCreationHub from '@/components/content/content-creation-hub';
import useDashboard from '@/components/dashboard/useDashboard';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentLists from '@/components/dashboard/RecentLists';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

export default function DashboardPage() {
  const { t } = useTranslation();
  const school = useCurrentSchool();
  const {
    isLoading,
    recentCourses,
    recentEnrollments,
    recentPayments,
    recentActivity,
    statsCards
  } = useDashboard();

  // Test the access control hook
  const {
    userState,
    isLoading: userLoading,
    error: userError
  } = useAccessControl();

  // Calculate actual revenue from payments
  const currentRevenue = recentPayments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const revenueTarget = 7500000; // 75,000 in smallest currency unit (cents or tomans)

  const quickActions = [
    {
      title: t('dashboard.createCourse'),
      description: t('dashboard.addNewCourse'),
      icon: require('lucide-react').Plus,
      href: '/content',
      color: 'bg-blue-500'
    },
    {
      title: t('dashboard.addLesson'),
      description: t('dashboard.createNewLesson'),
      icon: require('lucide-react').Play,
      href: '/content/lessons/create',
      color: 'bg-green-500'
    },
    {
      title: t('dashboard.uploadMedia'),
      description: t('dashboard.addMedia'),
      icon: require('lucide-react').FileText,
      href: '/content/media',
      color: 'bg-purple-500'
    },
    {
      title: t('dashboard.viewAnalytics'),
      description: t('dashboard.checkMetrics'),
      icon: require('lucide-react').BarChart3,
      href: '/analytics',
      color: 'bg-orange-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">
              {t('dashboard.loadingDashboardData')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeBack')} {t('dashboard.whatsHappening')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            {t('common.today')}
          </Button>
          <ContentCreationHub
            onContentCreated={() => {
              // Refresh dashboard data when content is created
              window.location.reload();
            }}
            courses={recentCourses}
          />
        </div>
      </div>

      <StatsCards cards={statsCards} />

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentActivityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activity.user
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            <CardDescription>
              {t('dashboard.quickActionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => (window.location.href = action.href)}
                >
                  <div
                    className={`mr-3 h-8 w-8 rounded-lg ${action.color} flex items-center justify-center`}
                  >
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <RecentLists
        courses={recentCourses}
        enrollments={recentEnrollments}
        payments={recentPayments}
      />

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.coursePerformance')}</CardTitle>
            <CardDescription>
              {t('dashboard.topPerformingCourses')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.students_count} {t('dashboard.students')}
                    </span>
                  </div>
                  <Progress
                    value={
                      (course.students_count /
                        Math.max(
                          ...recentCourses.map((c) => c.students_count)
                        )) *
                      100
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthlyGoals')}</CardTitle>
            <CardDescription>
              {t('dashboard.progressTowardsTargets')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.courseCreation')}
                  </span>
                  <span className="text-sm text-muted-foreground">3/5</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.studentEnrollment')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    1,234/2,000
                  </span>
                </div>
                <Progress value={62} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('dashboard.revenueTarget')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrencyWithSchool(currentRevenue, school)}/
                    {formatCurrencyWithSchool(revenueTarget, school)}
                  </span>
                </div>
                <Progress
                  value={
                    revenueTarget > 0
                      ? Math.min((currentRevenue / revenueTarget) * 100, 100)
                      : 0
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
