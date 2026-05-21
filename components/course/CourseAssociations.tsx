import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Layers } from 'lucide-react';
import { Course, Season } from '@/types/api';

type Props = { course: Course };

const CourseAssociations = ({ course }: Props) => {
  const seasons: Season[] = (course as any).Season || course.seasons || [];

  const totalLessons = seasons.reduce(
    (sum, s) => sum + ((s as any).Lesson?.length ?? s.lessons?.length ?? 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {seasons.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            No seasons yet — edit the course to add content.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                {seasons.length} season{seasons.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-1.5">
              {seasons.map((season, i) => {
                const lessons = (season as any).Lesson ?? season.lessons ?? [];
                return (
                  <div
                    key={season.id}
                    className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {season.title || `Season ${i + 1}`}
                      </span>
                    </div>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                      {lessons.length} lesson
                      {lessons.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseAssociations;
