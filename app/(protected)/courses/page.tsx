'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { BookOpen, Plus, Search, Edit, Eye, Users, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';

export default function CoursesPage() {
  const router = useRouter();
  const { selectedSchool } = useSchool();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedSchool) {
      fetchCourses();
    }
  }, [selectedSchool]);

  const fetchCourses = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getCourses();
      if (response && Array.isArray(response.courses)) {
        setCourses(response.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    router.push(`/courses/${course.id}`);
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/courses/${course.id}/edit`);
  };

  if (!selectedSchool) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              No School Selected
            </h2>
            <p className="text-muted-foreground">
              Please select a school from the header to view courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading courses...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage courses for {selectedSchool.name}
          </p>
        </div>
        <Button onClick={() => router.push('/courses/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses.length}</div>
          <p className="text-xs text-muted-foreground">
            Active courses in {selectedSchool.name}
          </p>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? `No courses match "${searchTerm}"`
              : 'Get started by creating your first course.'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => router.push('/courses/create')}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <Card key={course.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-lg">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {course.short_description || course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Basic Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {course.students_count || 0}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {course.lessons_count || 0}
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center">
                        ⭐ {course.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Status and Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Badge
                        variant={course.is_published ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      {course.is_featured && (
                        <Badge
                          variant="outline"
                          className="border-yellow-600 text-xs text-yellow-600"
                        >
                          Featured
                        </Badge>
                      )}
                    </div>
                    {course.price && course.price > 0 ? (
                      <span className="text-sm font-medium">
                        ${(course.price / 100).toFixed(2)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewCourse(course)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
