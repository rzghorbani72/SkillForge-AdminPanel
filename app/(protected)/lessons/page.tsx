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
import {
  Play,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  BookOpen
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';

export default function LessonsPage() {
  const { selectedSchool } = useSchool();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [lessonsResponse, coursesResponse] = await Promise.all([
        apiClient.getLessons(),
        apiClient.getCourses()
      ]);

      if (lessonsResponse.data && Array.isArray(lessonsResponse.data)) {
        const schoolLessons = lessonsResponse.data.filter(
          (lesson: Lesson) => lesson.school_id === selectedSchool.id
        );
        setLessons(schoolLessons);
      }

      if (coursesResponse.data && Array.isArray(coursesResponse.data)) {
        const schoolCourses = coursesResponse.data.filter(
          (course: Course) => course.school_id === selectedSchool.id
        );
        setCourses(schoolCourses);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              Please select a school from the header to view lessons.
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
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground">
            Lessons are now managed within courses and seasons
          </p>
        </div>
        <Button onClick={() => router.push('/courses')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Go to Courses
        </Button>
      </div>

      {/* Information Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            Lessons Management Moved
          </h3>
          <p className="mb-4 text-center text-muted-foreground">
            Lessons are now organized within courses and seasons for better
            content management.
            <br />
            Navigate to courses to manage your lessons.
          </p>
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/courses')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Go to Courses
            </Button>
            <Button variant="outline" onClick={() => router.push('/content')}>
              <Play className="mr-2 h-4 w-4" />
              Content Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
