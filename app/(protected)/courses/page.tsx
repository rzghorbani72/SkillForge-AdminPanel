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
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import CreateCourseDialog from '@/components/content/create-course-dialog';

export default function CoursesPage() {
  const { selectedSchool } = useSchool();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
        const schoolCourses = response.courses.filter(
          (course: Course) => course.school_id === selectedSchool.id
        );
        setCourses(schoolCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = () => {
    setIsCreateDialogOpen(false);
    fetchCourses();
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
      {filteredCourses.length === 0 ? (
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
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="text-sm">
                  {course.short_description || course.description}
                </CardDescription>
                {course.author && (
                  <div className="text-xs text-muted-foreground">
                    by {course.author.display_name || course.author.user?.name}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {course.students_count || 0} students
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {course.lessons_count || 0} lessons
                    </span>
                  </div>
                  {(course.rating > 0 || course.rating_count > 0) && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        ⭐ {course.rating.toFixed(1)} ({course.rating_count}{' '}
                        reviews)
                      </span>
                      {course.completion_rate && (
                        <span className="flex items-center">
                          📊 {course.completion_rate}% completion
                        </span>
                      )}
                    </div>
                  )}
                  {course.category && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        Category: {course.category.name}
                      </span>
                      {course.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty}
                        </Badge>
                      )}
                    </div>
                  )}
                  {course.language && (
                    <div className="text-center text-xs text-muted-foreground">
                      Language: {course.language.toUpperCase()}
                    </div>
                  )}
                  {course.seasons && course.seasons.length > 0 && (
                    <div className="text-center text-xs text-muted-foreground">
                      {course.seasons.length} season
                      {course.seasons.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {course.requirements && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Requirements:</strong> {course.requirements}
                    </div>
                  )}
                  {course.learning_outcomes && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Learning Outcomes:</strong>{' '}
                      {course.learning_outcomes}
                    </div>
                  )}
                  {((course.sales_count && course.sales_count > 0) ||
                    (course.revenue && course.revenue > 0)) && (
                    <div className="text-center text-xs text-muted-foreground">
                      💰 {course.sales_count || 0} sales • $
                      {((course.revenue || 0) / 100).toFixed(2)} revenue
                    </div>
                  )}
                  <div className="text-center text-xs text-muted-foreground">
                    Created: {new Date(course.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={course.is_published ? 'default' : 'secondary'}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      {course.is_featured && (
                        <Badge
                          variant="outline"
                          className="border-yellow-600 text-yellow-600"
                        >
                          Featured
                        </Badge>
                      )}
                    </div>
                    {course.price && course.price > 0 ? (
                      <span className="font-medium">
                        ${(course.price / 100).toFixed(2)}
                      </span>
                    ) : (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      {isCreateDialogOpen && (
        <CreateCourseDialog
          onCourseCreated={handleCourseCreated}
          schoolId={selectedSchool.id}
        />
      )}
    </div>
  );
}
