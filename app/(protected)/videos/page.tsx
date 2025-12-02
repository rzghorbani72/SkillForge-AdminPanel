'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Video, Star, Play, Clock, Sparkles, Film } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/hooks/useSchool';
import UploadVideoDialog from '@/components/content/upload-video-dialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import { VideoStats } from '@/components/videos/VideoStats';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { formatDuration, formatFileSize } from '@/components/shared/utils';
import { cn } from '@/lib/utils';

interface VideoWithMetadata extends Media {
  lesson_type?: 'WELCOME' | 'LESSON' | 'INTRO' | 'CONCLUSION';
  is_welcome_video?: boolean;
  duration?: number;
  tags?: string[];
  course_id?: number;
  poster_url?: string | null;
  streaming_url?: string;
  Owner?: { id: number; name: string };
  access_control?: {
    can_modify: boolean;
    can_delete: boolean;
    can_view: boolean;
    is_owner: boolean;
    user_role: string;
    user_permissions: string[];
  };
}

export default function VideosPage() {
  const { selectedSchool } = useSchool();
  const [videos, setVideos] = useState<VideoWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = useCallback(async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getVideos();

      if (response && response.data && Array.isArray(response.data)) {
        setVideos(response.data);
      } else if (Array.isArray(response)) {
        setVideos(response);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedSchool) {
      fetchData();
    }
  }, [selectedSchool, fetchData]);

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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'INTRO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CONCLUSION':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPosterUrl = (
    posterUrl: string | null | undefined
  ): string | null => {
    if (!posterUrl) return null;
    if (posterUrl.startsWith('http')) return posterUrl;
    return `${process.env.NEXT_PUBLIC_HOST || ''}${posterUrl}`;
  };

  const isOwnMedia = (video: VideoWithMetadata) => {
    return video.access_control?.is_owner || false;
  };

  if (!selectedSchool) {
    return (
      <div className="page-wrapper flex-1 p-6">
        <EmptyState
          icon={<Video className="h-10 w-10" />}
          title="No School Selected"
          description="Please select a school from the header to view videos."
        />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading videos..." />;
  }

  return (
    <div className="page-wrapper flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="icon-container-destructive">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Video Management
              </h1>
              <Badge
                variant="secondary"
                className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {videos.length} videos
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your course videos and welcome content
            </p>
          </div>
        </div>
        <UploadVideoDialog onVideoUploaded={fetchData} />
      </div>

      {/* Stats */}
      <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
        <VideoStats
          totalVideos={videos.length}
          welcomeVideos={welcomeVideos.length}
          lessonVideos={lessonVideos.length}
          totalDuration={videos.reduce(
            (total, video) => total + (video.metadata?.duration || 0),
            0
          )}
        />
      </div>

      {/* Search and Filter */}
      <div
        className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center"
        style={{ animationDelay: '0.15s' }}
      >
        <SearchBar
          placeholder="Search videos..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="flex-1"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 rounded-xl border border-border/50 bg-background/50 px-4 text-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      <Tabs
        defaultValue="all"
        className="fade-in-up space-y-6"
        style={{ animationDelay: '0.2s' }}
      >
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted/50 p-1">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            All ({videos.length})
          </TabsTrigger>
          <TabsTrigger
            value="welcome"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Welcome ({welcomeVideos.length})
          </TabsTrigger>
          <TabsTrigger
            value="lessons"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Lessons ({lessonVideos.length})
          </TabsTrigger>
          <TabsTrigger
            value="intro"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Intro ({introVideos.length})
          </TabsTrigger>
          <TabsTrigger
            value="conclusion"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Conclusion ({conclusionVideos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <VideoGrid
            videos={filteredVideos}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>

        <TabsContent value="welcome" className="space-y-4">
          <VideoGrid
            videos={welcomeVideos}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <VideoGrid
            videos={lessonVideos}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>

        <TabsContent value="intro" className="space-y-4">
          <VideoGrid
            videos={introVideos}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>

        <TabsContent value="conclusion" className="space-y-4">
          <VideoGrid
            videos={conclusionVideos}
            getVideoIcon={getVideoIcon}
            getVideoTypeColor={getVideoTypeColor}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
