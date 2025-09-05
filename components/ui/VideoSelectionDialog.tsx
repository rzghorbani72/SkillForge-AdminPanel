import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Play, Video, Calendar, User, Loader2, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface VideoSelectionDialogProps {
  onSelect: (video: { id: number; url: string; title?: string }) => void;
  selectedVideoId?: string | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface VideoItem {
  id: number;
  title: string;
  url: string;
  streaming_url?: string;
  poster_url?: string;
  size: number;
  mime_type: string;
  created_at: string;
  Owner?: {
    id: number;
    name: string;
  };
}

const VideoSelectionDialog: React.FC<VideoSelectionDialogProps> = ({
  onSelect,
  selectedVideoId,
  trigger,
  open,
  onOpenChange
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getVideos();
      if (response && Array.isArray(response)) {
        setVideos(response);
        setFilteredVideos(response);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter videos based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.Owner?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  // Load videos when dialog opens
  useEffect(() => {
    if (open) {
      fetchVideos();
    }
  }, [open]);

  const handleVideoSelect = (video: VideoItem) => {
    onSelect({
      id: video.id,
      url: video.streaming_url || video.url,
      title: video.title
    });
    onOpenChange?.(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Select Video
          </DialogTitle>
          <DialogDescription>
            Choose a video from your library to use in this lesson. This helps
            avoid uploading duplicate videos and saves storage space.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading...'
                : `${filteredVideos.length} of ${videos.length} videos`}
            </p>
            {videos.length > 0 && (
              <Badge variant="secondary">{videos.length} total</Badge>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search videos by title or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading videos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <X className="mb-2 h-8 w-8 text-destructive" />
              <p className="mb-4 text-destructive">{error}</p>
              <Button onClick={fetchVideos} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Video className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                {searchQuery
                  ? 'No videos found matching your search.'
                  : 'No videos available in your library.'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Upload your first video using the upload button above.
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    selectedVideoId === video.id.toString() &&
                      'ring-2 ring-primary'
                  )}
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Video Preview */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        {video.poster_url ? (
                          <img
                            src={video.poster_url}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="rounded-full bg-white/90 p-2">
                            <Play className="h-4 w-4 text-black" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="line-clamp-2 font-medium">
                            {video.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            From Library
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {video.mime_type.split('/')[1].toUpperCase()}
                          </Badge>
                          <span>{formatFileSize(video.size)}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{video.Owner?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(video.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSelectionDialog;
