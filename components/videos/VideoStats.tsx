import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Star, Play, Clock } from 'lucide-react';

interface VideoStatsProps {
  totalVideos: number;
  welcomeVideos: number;
  lessonVideos: number;
  totalDuration: number;
}

export function VideoStats({
  totalVideos,
  welcomeVideos,
  lessonVideos,
  totalDuration
}: VideoStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVideos}</div>
          <p className="text-xs text-muted-foreground">All video content</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Welcome Videos</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{welcomeVideos}</div>
          <p className="text-xs text-muted-foreground">Default course videos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lesson Videos</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lessonVideos}</div>
          <p className="text-xs text-muted-foreground">Course content videos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(totalDuration / 60)}h
          </div>
          <p className="text-xs text-muted-foreground">Combined video length</p>
        </CardContent>
      </Card>
    </div>
  );
}
