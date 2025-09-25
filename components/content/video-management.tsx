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
  Video,
  Play,
  Clock,
  Star,
  Edit,
  Download,
  Eye,
  Search
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Media } from '@/types/api';

interface VideoManagementProps {
  courseId?: number;
  onVideoSelected?: (video: Media) => void;
}

interface VideoWithMetadata extends Media {
  lesson_type?: 'WELCOME' | 'LESSON' | 'INTRO' | 'CONCLUSION';
  is_welcome_video?: boolean;
  duration?: number;
  tags?: string[];
  course_id?: number;
}

export default function VideoManagement({
  courseId,
  onVideoSelected
}: VideoManagementProps) {
  const [videos, setVideos] = useState<VideoWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchVideos();
  }, [courseId]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getVideos();
      const videosData = response.data as any;
      const videosList = Array.isArray(videosData) ? videosData : [];

      // Filter by course if courseId is provided
      const filteredVideos = courseId
        ? videosList.filter(
            (video: VideoWithMetadata) => video.course_id === courseId
          )
        : videosList;

      setVideos(filteredVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Management</h2>
          <p className="text-muted-foreground">
            Manage your course videos and welcome content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{videos.length} videos</Badge>
        </div>
      </div>

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

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="py-12 text-center">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No videos found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload your first video to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className={`relative cursor-pointer transition-shadow hover:shadow-md ${
                video.is_welcome_video ? 'ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => onVideoSelected?.(video)}
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
                  <CardTitle className="truncate text-lg">
                    {video.title}
                  </CardTitle>
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
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
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
      )}
    </div>
  );
}
