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
  File
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Lesson, Season, Media } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';

export default function ContentPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);

      // Fetch lessons
      try {
        const lessonsResponse = await apiClient.getLessons();
        const lessonsData = lessonsResponse.data as any;
        setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLessons([]);
      }

      // Fetch seasons
      try {
        const seasonsResponse = await apiClient.getSeasons();
        const seasonsData = seasonsResponse.data as any;
        setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
      } catch (error) {
        console.error('Error fetching seasons:', error);
        setSeasons([]);
      }

      // Fetch media
      try {
        const mediaResponse = await apiClient.getMedia();
        const mediaData = mediaResponse.data as any;
        setMedia(Array.isArray(mediaData) ? mediaData : []);
      } catch (error) {
        console.error('Error fetching media:', error);
        setMedia([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return Video;
      case 'AUDIO':
        return Music;
      case 'IMAGE':
        return Image;
      default:
        return File;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-red-100 text-red-800';
      case 'AUDIO':
        return 'bg-blue-100 text-blue-800';
      case 'IMAGE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading content...</p>
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
            Manage your lessons, seasons, and media library
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
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

      {/* Content Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
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
            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{media.length}</div>
            <p className="text-xs text-muted-foreground">
              Images, videos, documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="seasons">Seasons ({seasons.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lessons</CardTitle>
              <CardDescription>
                Your latest lessons and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.length === 0 ? (
                  <div className="py-8 text-center">
                    <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No lessons found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first lesson to get started.
                    </p>
                  </div>
                ) : (
                  lessons.slice(0, 5).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Play className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {lesson.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.description?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {lesson.duration || '0'} min
                        </Badge>
                        <Badge
                          variant={
                            lesson.is_published ? 'default' : 'secondary'
                          }
                        >
                          {lesson.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Seasons</CardTitle>
              <CardDescription>
                Organized course modules and their content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasons.length === 0 ? (
                  <div className="py-8 text-center">
                    <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">
                      No seasons found
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create seasons to organize your course content.
                    </p>
                  </div>
                ) : (
                  seasons.slice(0, 5).map((season) => (
                    <div
                      key={season.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {season.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {season.description?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {season.lessons?.length || 0} lessons
                        </Badge>
                        <Badge
                          variant={
                            season.is_published ? 'default' : 'secondary'
                          }
                        >
                          {season.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Images, videos, and documents for your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {media.length === 0 ? (
                  <div className="py-8 text-center">
                    <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No media found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload media files to enhance your courses.
                    </p>
                  </div>
                ) : (
                  media.slice(0, 5).map((item) => {
                    const MediaIcon = getMediaIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <MediaIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getMediaTypeColor(item.type)}>
                            {item.type}
                          </Badge>
                          <Badge variant="outline">
                            {item.size
                              ? `${(item.size / 1024 / 1024).toFixed(1)} MB`
                              : 'Unknown'}
                          </Badge>
                        </div>
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
