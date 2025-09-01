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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Layers,
  Image,
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  Music,
  File,
  BookOpen,
  Clock,
  Users,
  Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Media, Course, Category } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import ContentCreationHub from '@/components/content/content-creation-hub';
import { useSchool } from '@/contexts/SchoolContext';

export default function ContentPage() {
  const { selectedSchool } = useSchool();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedSchool) {
      fetchContent();
    }
  }, [selectedSchool]);

  const fetchContent = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);

      // Fetch courses for the selected school
      try {
        const coursesResponse = await apiClient.getCourses();
        if (coursesResponse.status === 'ok' && coursesResponse.data) {
          // Filter courses by selected school
          const schoolCourses = coursesResponse.data.filter(
            (course: Course) => course.school_id === selectedSchool.id
          );
          setCourses(schoolCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }

      // Fetch categories for the selected school
      try {
        const categoriesResponse = await apiClient.getCategories();
        if (categoriesResponse.status === 'ok' && categoriesResponse.data) {
          // Filter categories by selected school
          const schoolCategories = categoriesResponse.data.filter(
            (category: Category) => category.school_id === selectedSchool.id
          );
          setCategories(schoolCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }

      // Fetch other content types for the selected school
      try {
        const [lessonsResponse, seasonsResponse, mediaResponse] =
          await Promise.all([
            apiClient.getLessons(),
            apiClient.getSeasons(),
            apiClient.getMedia()
          ]);

        if (lessonsResponse.status === 'ok' && lessonsResponse.data) {
          const schoolLessons = lessonsResponse.data.filter(
            (lesson: Lesson) => lesson.school_id === selectedSchool.id
          );
          setLessons(schoolLessons);
        }

        if (seasonsResponse.status === 'ok' && seasonsResponse.data) {
          const schoolSeasons = seasonsResponse.data.filter(
            (season: Season) => season.school_id === selectedSchool.id
          );
          setSeasons(schoolSeasons);
        }

        if (mediaResponse.status === 'ok' && mediaResponse.data) {
          const schoolMedia = mediaResponse.data.filter(
            (item: Media) => item.school_id === selectedSchool.id
          );
          setMedia(schoolMedia);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter content based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSeasons = seasons.filter(
    (season) =>
      season.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      season.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMedia = media.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
              Please select a school from the header to view content.
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
            Content Management
          </h1>
          <p className="text-muted-foreground">
            Manage content for{' '}
            <span className="font-semibold">{selectedSchool.name}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <ContentCreationHub
            onContentCreated={fetchContent}
            courses={courses}
            categories={categories}
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Content Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">Available lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seasons.length}</div>
            <p className="text-xs text-muted-foreground">Course modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.length}</div>
            <p className="text-xs text-muted-foreground">
              Images, videos, audio, documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="seasons">Seasons ({seasons.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span>{course.students?.length || 0} students</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Duration: {lesson.duration || 'N/A'}</span>
                    <span>Course: {lesson.course?.title || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasons" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSeasons.map((season) => (
              <Card key={season.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{season.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {season.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Course: {season.course?.title || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMedia.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Type: {item.type}</span>
                    <span>Size: {item.file_size || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
