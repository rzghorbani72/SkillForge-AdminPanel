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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BookOpen,
  Eye,
  Clock,
  Star,
  Calendar,
  Filter
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course, Enrollment, Payment } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export default function AnalyticsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Fetch courses
      try {
        const coursesResponse = await apiClient.getCourses();
        const coursesData = coursesResponse.data as any;
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }

      // Fetch enrollments
      try {
        const enrollmentsResponse = await apiClient.getEnrollments();
        const enrollmentsData = enrollmentsResponse.data as any;
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      }

      // Fetch payments
      try {
        const paymentsResponse = await apiClient.getPayments();
        const paymentsData = paymentsResponse.data as any;
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for charts (replace with real data from API)
  const revenueData = [
    { month: 'Jan', revenue: 4000, enrollments: 24 },
    { month: 'Feb', revenue: 3000, enrollments: 13 },
    { month: 'Mar', revenue: 2000, enrollments: 18 },
    { month: 'Apr', revenue: 2780, enrollments: 39 },
    { month: 'May', revenue: 1890, enrollments: 48 },
    { month: 'Jun', revenue: 2390, enrollments: 38 },
    { month: 'Jul', revenue: 3490, enrollments: 43 }
  ];

  // Ensure all arrays are safe
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  const coursePerformanceData = safeCourses.slice(0, 5).map((course) => ({
    name: course.title,
    students: course.students_count || 0,
    revenue: (course.students_count || 0) * 99, // Mock revenue calculation
    completion: Math.floor(Math.random() * 100) // Mock completion rate
  }));

  const studentEngagementData = [
    {
      name: 'Active',
      value: safeEnrollments.filter((e) => e.status === 'ACTIVE').length,
      color: '#10b981'
    },
    {
      name: 'Completed',
      value: safeEnrollments.filter((e) => e.status === 'COMPLETED').length,
      color: '#3b82f6'
    },
    {
      name: 'Inactive',
      value: safeEnrollments.filter((e) => e.status === 'CANCELLED').length,
      color: '#ef4444'
    }
  ];

  const totalRevenue = safePayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const totalEnrollments = safeEnrollments.length;
  const activeEnrollments = safeEnrollments.filter(
    (e) => e.status === 'ACTIVE'
  ).length;
  const completionRate =
    totalEnrollments > 0
      ? Math.round(
          (safeEnrollments.filter((e) => e.status === 'COMPLETED').length /
            totalEnrollments) *
            100
        )
      : 0;

  // Debug logging
  console.log('Analytics data state:', {
    courses: courses,
    safeCourses: safeCourses,
    enrollments: enrollments,
    safeEnrollments: safeEnrollments,
    payments: payments,
    safePayments: safePayments,
    totalRevenue: totalRevenue,
    totalEnrollments: totalEnrollments
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance, revenue, and student engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Course completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue and enrollment trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Engagement</CardTitle>
                <CardDescription>
                  Distribution of student enrollment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={studentEngagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {studentEngagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed revenue breakdown and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Top performing courses by enrollment and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={coursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#8884d8" />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Performance Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Courses by Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coursePerformanceData
                    .sort((a, b) => b.students - a.students)
                    .slice(0, 5)
                    .map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {course.students} students
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {course.completion}% completion
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coursePerformanceData
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((course, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {course.name}
                          </span>
                          <span className="text-sm font-medium">
                            ${course.revenue}
                          </span>
                        </div>
                        <Progress
                          value={
                            (course.revenue /
                              Math.max(
                                ...coursePerformanceData.map((c) => c.revenue)
                              )) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Metrics</CardTitle>
              <CardDescription>
                Track how students interact with your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((activeEnrollments / totalEnrollments) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Engagement
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {completionRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.floor(Math.random() * 20) + 80}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Satisfaction Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
