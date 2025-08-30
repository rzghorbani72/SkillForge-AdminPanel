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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { User, Enrollment, Profile } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    try {
      setIsLoading(true);

      // Fetch students (users with student role)
      try {
        const studentsResponse = await apiClient.getUsers();
        const studentsData = studentsResponse.data as any;
        const allUsers = Array.isArray(studentsData) ? studentsData : [];
        // Filter for students (this would need to be adjusted based on your role system)
        setStudents(allUsers);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
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

      // Fetch profiles
      try {
        const profilesResponse = await apiClient.getProfiles();
        const profilesData = profilesResponse.data as any;
        setProfiles(Array.isArray(profilesData) ? profilesData : []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching students data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (enrollment: Enrollment) => {
    if (!enrollment.progress || enrollment.progress.length === 0) return 0;
    const completedLessons = enrollment.progress.filter(
      (p) => p.status === 'COMPLETED'
    ).length;
    const totalLessons = enrollment.progress.length;
    return totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">
              Loading students data...
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
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage your students, track enrollments, and monitor progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Enrollments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter((e) => e.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Courses
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter((e) => e.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.length > 0
                ? Math.round(
                    enrollments.reduce(
                      (acc, e) => acc + getProgressPercentage(e),
                      0
                    ) / enrollments.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                Manage your student roster and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No students found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Students will appear here once they register.
                    </p>
                  </div>
                ) : (
                  students.slice(0, 10).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-4"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{student.phone_number}</Badge>
                        <Badge
                          variant={student.is_active ? 'default' : 'secondary'}
                        >
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>
                Track student enrollments and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="py-8 text-center">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No enrollments found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enrollments will appear here once students join courses.
                    </p>
                  </div>
                ) : (
                  enrollments.slice(0, 10).map((enrollment) => (
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
                          {enrollment.course?.title || 'Unknown Course'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getEnrollmentStatusColor(
                            enrollment.status
                          )}
                        >
                          {enrollment.status}
                        </Badge>
                        <Badge variant="outline">
                          {new Date(
                            enrollment.enrolled_at
                          ).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor student progress across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.length === 0 ? (
                  <div className="py-8 text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No progress data
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Progress will be tracked once students start courses.
                    </p>
                  </div>
                ) : (
                  enrollments.slice(0, 10).map((enrollment) => {
                    const progressPercentage =
                      getProgressPercentage(enrollment);
                    return (
                      <div key={enrollment.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {enrollment.user?.name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {enrollment.user?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {enrollment.course?.title || 'Unknown Course'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {progressPercentage}%
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
