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
      if (response.status === 'ok' && response.data) {
        const schoolCourses = response.data.filter(
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="text-sm">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {course.students?.length || 0} students
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {course.lessons?.length || 0} lessons
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={course.is_published ? 'default' : 'secondary'}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {course.price && course.price > 0 ? (
                    <span className="font-medium">${course.price}</span>
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
