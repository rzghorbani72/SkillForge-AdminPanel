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
  Video,
  Plus,
  Search,
  Filter,
  Star,
  Play,
  Clock,
  Eye,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media, Course } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import UploadVideoDialog from '@/components/content/upload-video-dialog';
import VideoPlayer from '@/components/content/video-player';

interface VideoWithMetadata extends Media {
  lesson_type?: 'WELCOME' | 'LESSON' | 'INTRO' | 'CONCLUSION';
  is_welcome_video?: boolean;
  duration?: number;
  tags?: string[];
  course_id?: number;
}

export default function VideosPage() {
  const { selectedSchool } = useSchool();
  const [videos, setVideos] = useState<VideoWithMetadata[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoWithMetadata | null>(
    null
  );
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool]);

  const fetchData = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const [videosResponse, coursesResponse] = await Promise.all([
        apiClient.getVideos(),
        apiClient.getCourses()
      ]);

      if (videosResponse.status === 'ok' && videosResponse.data) {
        const schoolVideos = videosResponse.data.filter(
          (item: Media) =>
            item.school_id === selectedSchool.id && item.type === 'video'
        );
        setVideos(schoolVideos);
      }

      if (coursesResponse.status === 'ok' && coursesResponse.data) {
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

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      video.lesson_type === filterType ||
      (filterType === 'welcome' && video.is_welcome_video);

    return matchesSearch && matchesFilter;
  });

  const welcomeVideos = videos.filter((video) => video.is_welcome_video);
  const lessonVideos = videos.filter((video) => video.lesson_type === 'LESSON');
  const introVideos = videos.filter((video) => video.lesson_type === 'INTRO');
  const conclusionVideos = videos.filter(
    (video) => video.lesson_type === 'CONCLUSION'
  );

  const getVideoIcon = (type?: string) => {
    switch (type) {
      case 'WELCOME':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'INTRO':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'CONCLUSION':
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Video className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVideoTypeColor = (type?: string) => {
    switch (type) {
      case 'WELCOME':
        return 'bg-yellow-100 text-yellow-800';
      case 'INTRO':
        return 'bg-blue-100 text-blue-800';
      case 'CONCLUSION':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleVideoSelect = (video: VideoWithMetadata) => {
    setSelectedVideo(video);
    setShowPlayer(true);
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
              Please select a school from the header to view videos.
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
            <p className="mt-2 text-sm text-gray-600">Loading videos...</p>
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
            Video Management
          </h1>
          <p className="text-muted-foreground">
            Manage your course videos and welcome content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UploadVideoDialog onVideoUploaded={fetchData} />
        </div>
      </div>

      {/* Video Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">All video content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Welcome Videos
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{welcomeVideos.length}</div>
            <p className="text-xs text-muted-foreground">
              Default course videos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Videos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonVideos.length}</div>
            <p className="text-xs text-muted-foreground">
              Course content videos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(videos.reduce(
                (total, video) => total + (video.metadata?.duration || 0),
                0
              ) /
                60) |
                0}
              h
            </div>
            <p className="text-xs text-muted-foreground">
              Combined video length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPlayer(false)}
                className="border-white text-white hover:bg-white/20"
              >
                Close
              </Button>
            </div>
            <VideoPlayer
              video={selectedVideo}
              autoPlay={true}
              onVideoEnd={() => setShowPlayer(false)}
            />
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Videos</option>
          <option value="welcome">Welcome Videos</option>
          <option value="WELCOME">Welcome Type</option>
          <option value="LESSON">Lesson Content</option>
          <option value="INTRO">Introduction</option>
          <option value="CONCLUSION">Conclusion</option>
        </select>
      </div>

      {/* Video Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Videos ({videos.length})</TabsTrigger>
          <TabsTrigger value="welcome">
            Welcome ({welcomeVideos.length})
          </TabsTrigger>
          <TabsTrigger value="lessons">
            Lessons ({lessonVideos.length})
          </TabsTrigger>
          <TabsTrigger value="intro">Intro ({introVideos.length})</TabsTrigger>
          <TabsTrigger value="conclusion">
            Conclusion ({conclusionVideos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <VideoGrid
            videos={filteredVideos}
            onVideoSelect={handleVideoSelect}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </TabsContent>

        <TabsContent value="welcome" className="space-y-4">
          <VideoGrid
            videos={welcomeVideos}
            onVideoSelect={handleVideoSelect}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <VideoGrid
            videos={lessonVideos}
            onVideoSelect={handleVideoSelect}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </TabsContent>

        <TabsContent value="intro" className="space-y-4">
          <VideoGrid
            videos={introVideos}
            onVideoSelect={handleVideoSelect}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </TabsContent>

        <TabsContent value="conclusion" className="space-y-4">
          <VideoGrid
            videos={conclusionVideos}
            onVideoSelect={handleVideoSelect}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Video Grid Component
function VideoGrid({
  videos,
  onVideoSelect,
  getVideoIcon,
  getVideoTypeColor,
  formatDuration,
  formatFileSize
}: {
  videos: VideoWithMetadata[];
  onVideoSelect: (video: VideoWithMetadata) => void;
  getVideoIcon: (type?: string) => React.ReactNode;
  getVideoTypeColor: (type?: string) => string;
  formatDuration: (seconds?: number) => string;
  formatFileSize: (bytes?: number) => string;
}) {
  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <Video className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No videos found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your first video to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card
          key={video.id}
          className={`relative cursor-pointer transition-shadow hover:shadow-md ${
            video.is_welcome_video ? 'ring-2 ring-yellow-400' : ''
          }`}
          onClick={() => onVideoSelect(video)}
        >
          {video.is_welcome_video && (
            <div className="absolute right-2 top-2 z-10">
              <Badge className="bg-yellow-500 text-white">
                <Star className="mr-1 h-3 w-3" />
                Welcome
              </Badge>
            </div>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              {getVideoIcon(video.lesson_type)}
              <CardTitle className="truncate text-lg">{video.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {video.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Video Type Badge */}
            <div className="flex items-center space-x-2">
              <Badge className={getVideoTypeColor(video.lesson_type)}>
                {video.lesson_type || 'VIDEO'}
              </Badge>
              {video.is_welcome_video && (
                <Badge
                  variant="outline"
                  className="border-yellow-600 text-yellow-600"
                >
                  Default
                </Badge>
              )}
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(video.metadata?.duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatFileSize(video.size)}</span>
              </div>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{video.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="mr-1 h-3 w-3" />
                Play
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
