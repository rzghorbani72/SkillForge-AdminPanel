import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Star, Play, Clock, Eye, Download, Edit } from 'lucide-react';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import { formatDuration, formatFileSize } from '@/components/shared/utils';

interface VideoWithMetadata {
  id: number;
  title: string;
  description?: string;
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
  metadata?: { duration?: number };
  size?: number;
}

interface VideoCardProps {
  video: VideoWithMetadata;
  onVideoSelect: (video: VideoWithMetadata) => void;
  getVideoIcon: (type?: string) => React.ReactNode;
  getVideoTypeColor: (type?: string) => string;
  getPosterUrl: (posterUrl: string | null | undefined) => string | null;
  isOwnMedia: (video: VideoWithMetadata) => boolean;
}

export function VideoCard({
  video,
  onVideoSelect,
  getVideoIcon,
  getVideoTypeColor,
  getPosterUrl,
  isOwnMedia
}: VideoCardProps) {
  return (
    <Card
      className={`relative cursor-pointer transition-shadow hover:shadow-md ${
        video.is_welcome_video ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={() => onVideoSelect(video)}
    >
      {/* Video Poster Preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        {getPosterUrl(video.poster_url) ? (
          <img
            src={getPosterUrl(video.poster_url)!}
            alt={`${video.title} poster`}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
              <Video className="h-8 w-8" />
              <span className="text-sm">No Poster</span>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
          <div className="rounded-full bg-white/90 p-3">
            <Play className="h-6 w-6 text-black" />
          </div>
        </div>

        {/* Welcome Video Badge */}
        {video.is_welcome_video && (
          <div className="absolute right-2 top-2 z-10">
            <Badge className="bg-yellow-500 text-white">
              <Star className="mr-1 h-3 w-3" />
              Welcome
            </Badge>
          </div>
        )}

        {/* Access Control Badge */}
        <div className="absolute left-2 top-2 z-10">
          {video.access_control ? (
            <AccessControlBadge
              accessControl={video.access_control}
              className="text-xs"
            />
          ) : (
            <Badge
              variant={isOwnMedia(video) ? 'default' : 'secondary'}
              className="text-xs"
            >
              {isOwnMedia(video) ? 'Yours' : 'Other Teacher'}
            </Badge>
          )}
        </div>
      </div>

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

          {video.access_control ? (
            <AccessControlActions
              accessControl={video.access_control}
              onEdit={() => console.log('Edit video', video.id)}
              onDelete={() => console.log('Delete video', video.id)}
              onView={() => console.log('View video', video.id)}
            />
          ) : (
            <>
              <Button size="sm" variant="outline">
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
