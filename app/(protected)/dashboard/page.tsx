'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Play,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import { dashboardStats, recentActivity } from '@/constants/data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useSchool } from '@/contexts/SchoolContext';
import { useCategoriesStore } from '@/lib/store';

export default function DashboardPage() {
  const [stats] = useState(dashboardStats);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    selectedSchool,
    schools,
    isLoading: schoolLoading,
    error
  } = useSchool();

  const { categories } = useCategoriesStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch recent courses
        try {
          const coursesResponse = await apiClient.getCourses({ limit: 5 });
          console.log('Courses response:', coursesResponse);

          // Handle different possible response structures
          let coursesData: Course[] = [];
          const responseData = coursesResponse.data as any;

          if (responseData && Array.isArray(responseData)) {
            coursesData = responseData;
          } else if (
            responseData &&
            responseData.data &&
            Array.isArray(responseData.data)
          ) {
            coursesData = responseData.data;
          } else if (
            responseData &&
            responseData.courses &&
            Array.isArray(responseData.courses)
          ) {
            coursesData = responseData.courses;
          }

          setRecentCourses(coursesData);
        } catch (error) {
          console.error('Error fetching courses:', error);
          setRecentCourses([]);
        }

        // Fetch recent enrollments
        try {
          const enrollmentsResponse = await apiClient.getRecentEnrollments();
          console.log('Enrollments response:', enrollmentsResponse);

          let enrollmentsData: Enrollment[] = [];
          const enrollmentsResponseData = enrollmentsResponse.data as any;

          if (
            enrollmentsResponseData &&
            Array.isArray(enrollmentsResponseData)
          ) {
            enrollmentsData = enrollmentsResponseData;
          } else if (
            enrollmentsResponseData &&
            enrollmentsResponseData.data &&
            Array.isArray(enrollmentsResponseData.data)
          ) {
            enrollmentsData = enrollmentsResponseData.data;
          }

          setRecentEnrollments(enrollmentsData);
        } catch (error) {
          console.error('Error fetching enrollments:', error);
          setRecentEnrollments([]);
        }

        // Fetch recent payments
        try {
          const paymentsResponse = await apiClient.getRecentPayments();
          console.log('Payments response:', paymentsResponse);

          let paymentsData: Payment[] = [];
          const paymentsResponseData = paymentsResponse.data as any;

          if (paymentsResponseData && Array.isArray(paymentsResponseData)) {
            paymentsData = paymentsResponseData;
          } else if (
            paymentsResponseData &&
            paymentsResponseData.data &&
            Array.isArray(paymentsResponseData.data)
          ) {
            paymentsData = paymentsResponseData.data;
          }

          setRecentPayments(paymentsData);
        } catch (error) {
          console.error('Error fetching payments:', error);
          setRecentPayments([]);
        }

        // Categories are now loaded at the layout level via CategoriesInitializer
        // No need to fetch them here anymore
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      change: '+12%',
      changeType: 'increase' as const,
      description: 'From last month'
    },
    {
      title: 'Total Students',
      value: formatNumber(stats.totalStudents),
      icon: Users,
      change: '+8%',
      changeType: 'increase' as const,
      description: 'From last month'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: '+23%',
      changeType: 'increase' as const,
      description: 'From last month'
    },
    {
      title: 'Active Enrollments',
      value: stats.activeEnrollments,
      icon: TrendingUp,
      change: '+5%',
      changeType: 'increase' as const,
      description: 'From last month'
    }
  ];

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Add a new course to your school',
      icon: Plus,
      href: '/content',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Lesson',
      description: 'Create a new lesson for your courses',
      icon: Play,
      href: '/content/lessons/create',
      color: 'bg-green-500'
    },
    {
      title: 'Upload Media',
      description: 'Add images, videos, or documents',
      icon: FileText,
      href: '/content/media',
      color: 'bg-purple-500'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: BarChart3,
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

  // Ensure we always have arrays to prevent map errors
  const safeRecentCourses = Array.isArray(recentCourses) ? recentCourses : [];
  const safeRecentEnrollments = Array.isArray(recentEnrollments)
    ? recentEnrollments
    : [];
  const safeRecentPayments = Array.isArray(recentPayments)
    ? recentPayments
    : [];
  const safeRecentActivity = Array.isArray(recentActivity)
    ? recentActivity
    : [];

  // Add fallback data if all arrays are empty
  const hasData =
    safeRecentCourses.length > 0 ||
    safeRecentEnrollments.length > 0 ||
    safeRecentPayments.length > 0;

  // Debug logging
  console.log('Dashboard data state:', {
    recentCourses: recentCourses,
    safeRecentCourses: safeRecentCourses,
    recentEnrollments: recentEnrollments,
    safeRecentEnrollments: safeRecentEnrollments,
    recentPayments: recentPayments,
    safeRecentPayments: safeRecentPayments,
    hasData: hasData
  });

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* School Context Debug */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">School Context Debug</CardTitle>
          <CardDescription className="text-amber-700">
            Current state of school selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Loading:</span>
            <Badge variant={isLoading ? 'default' : 'secondary'}>
              {isLoading ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Error:</span>
            <Badge variant={error ? 'destructive' : 'secondary'}>
              {error || 'None'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Schools Count:</span>
            <Badge variant="outline">{schools.length}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Selected School:</span>
            <Badge variant="outline">{selectedSchool?.name || 'None'}</Badge>
          </div>
          {schools.length > 0 && (
            <div className="mt-2 rounded border bg-white p-2">
              <p className="text-sm font-medium">Available Schools:</p>
              <ul className="mt-1 space-y-1 text-xs">
                {schools.map((school) => (
                  <li key={school.id}>
                    • {school.name} (ID: {school.id}) -{' '}
                    {school.domain?.private_address || school.slug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span
                  className={`flex items-center ${
                    card.changeType === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {card.changeType === 'increase' ? '↗' : '↘'}{' '}
                  {card.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              {safeRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activity.user
                        .split(' ')
                        .map((n) => n[0])
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

      {/* Tabs Section */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Recent Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Recent Enrollments</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>
                Your latest courses and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeRecentCourses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {course.short_description ||
                          course.description.substring(0, 100)}
                        ...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={course.is_published ? 'default' : 'secondary'}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {course.students_count} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>
                Latest student enrollments across your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeRecentEnrollments.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No recent enrollments
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enrollments will appear here once students join your
                      courses.
                    </p>
                  </div>
                ) : (
                  safeRecentEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center space-x-4"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {enrollment.user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {enrollment.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled in{' '}
                          {enrollment.course?.title || 'Unknown Course'}
                        </p>
                      </div>
                      <Badge variant="outline">{enrollment.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Latest payment transactions from your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeRecentPayments.length === 0 ? (
                  <div className="py-8 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No recent payments
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Payment transactions will appear here once students
                      purchase your courses.
                    </p>
                  </div>
                ) : (
                  safeRecentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {payment.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.course?.title || 'Unknown Course'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <Badge
                          variant={
                            payment.status === 'COMPLETED'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeRecentCourses.slice(0, 3).map((course) => (
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
                          ...safeRecentCourses.map((c) => c.students_count)
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
