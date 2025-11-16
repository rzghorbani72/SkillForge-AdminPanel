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

export default function DashboardPage() {
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

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course to your school',
      icon: require('lucide-react').Plus,
      href: '/content',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Lesson',
      description: 'Create a new lesson for your courses',
      icon: require('lucide-react').Play,
      href: '/content/lessons/create',
      color: 'bg-green-500'
    },
    {
      title: 'Upload Media',
      description: 'Add images, videos, or documents',
      icon: require('lucide-react').FileText,
      href: '/content/media',
      color: 'bg-purple-500'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
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
              Loading dashboard data...
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your schools
            today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Today
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
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your schools and courses
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
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
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.students_count} students
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
            <CardTitle>Monthly Goals</CardTitle>
            <CardDescription>
              Progress towards your monthly targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Course Creation</span>
                  <span className="text-sm text-muted-foreground">3/5</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Student Enrollment
                  </span>
                  <span className="text-sm text-muted-foreground">
                    1,234/2,000
                  </span>
                </div>
                <Progress value={62} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue Target</span>
                  <span className="text-sm text-muted-foreground">
                    $45,678/$75,000
                  </span>
                </div>
                <Progress value={61} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
