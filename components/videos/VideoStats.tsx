import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Star, Play, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

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
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('media.totalVideos')}
          </CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVideos}</div>
          <p className="text-xs text-muted-foreground">
            {t('media.allVideoContent')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('media.welcomeVideos')}
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{welcomeVideos}</div>
          <p className="text-xs text-muted-foreground">
            {t('media.defaultCourseVideos')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('media.lessonVideos')}
          </CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lessonVideos}</div>
          <p className="text-xs text-muted-foreground">
            {t('media.courseContentVideos')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('media.totalDuration')}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(totalDuration / 60)}h
          </div>
          <p className="text-xs text-muted-foreground">
            {t('media.combinedVideoLength')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
