'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Star, Play, Clock, Eye, Download, Edit } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useSchool } from '@/contexts/SchoolContext';
import UploadVideoDialog from '@/components/content/upload-video-dialog';
import VideoPlayer from '@/components/content/video-player';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import { VideoStats } from '@/components/videos/VideoStats';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { formatDuration, formatFileSize } from '@/components/shared/utils';

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
  const [selectedVideo, setSelectedVideo] = useState<VideoWithMetadata | null>(
    null
  );
  const [showPlayer, setShowPlayer] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getVideos();

      // Handle new response structure with access control
      if (response && response.data && Array.isArray(response.data)) {
        setVideos(response.data);
      } else if (Array.isArray(response)) {
        // Fallback for old response format
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
        return 'bg-yellow-100 text-yellow-800';
      case 'INTRO':
        return 'bg-blue-100 text-blue-800';
      case 'CONCLUSION':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleVideoSelect = (video: VideoWithMetadata) => {
    setSelectedVideo(video);
    setShowPlayer(true);
  };

  if (!selectedSchool) {
    return (
      <EmptyState
        icon={<Video className="h-12 w-12" />}
        title="No School Selected"
        description="Please select a school from the header to view videos."
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading videos..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Video Management"
        description="Manage your course videos and welcome content"
      >
        <div className="flex items-center space-x-2">
          <UploadVideoDialog onVideoUploaded={fetchData} />
        </div>
      </PageHeader>

      <VideoStats
        totalVideos={videos.length}
        welcomeVideos={welcomeVideos.length}
        lessonVideos={lessonVideos.length}
        totalDuration={videos.reduce(
          (total, video) => total + (video.metadata?.duration || 0),
          0
        )}
      />

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

      <div className="flex items-center space-x-4">
        <SearchBar
          placeholder="Search videos..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
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
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
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
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
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
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
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
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
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
            getPosterUrl={getPosterUrl}
            isOwnMedia={isOwnMedia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
