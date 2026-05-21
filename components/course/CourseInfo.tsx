import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Star, Calendar, User, Hash } from 'lucide-react';
import { Course } from '@/types/api';

type Props = { course: Course };

function Stat({
  icon: Icon,
  label,
  value
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

const CourseInfo = ({ course }: Props) => {
  const author = (course as any).Profile || course.author;
  const category = (course as any).Category || course.category;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            icon={Users}
            label="Students"
            value={course.students_count ?? 0}
          />
          <Stat
            icon={BookOpen}
            label="Lessons"
            value={course.lessons_count ?? 0}
          />
          <Stat
            icon={Star}
            label="Rating"
            value={
              course.rating ? (
                <span>
                  {Number(course.rating).toFixed(1)}{' '}
                  <span className="text-xs text-muted-foreground">
                    ({course.rating_count ?? 0})
                  </span>
                </span>
              ) : (
                'No ratings'
              )
            }
          />
          <Stat
            icon={Calendar}
            label="Created"
            value={
              course.created_at
                ? new Date(course.created_at).toLocaleDateString()
                : '—'
            }
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Description</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {course.description || (
              <span className="italic">No description provided.</span>
            )}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 border-t pt-4">
          {author && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{author.display_name}</span>
            </div>
          )}
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span className="font-mono">{course.slug}</span>
          </div>
          {course.is_free && (
            <Badge
              variant="outline"
              className="border-emerald-300 text-xs text-emerald-600"
            >
              Free
            </Badge>
          )}
          {course.is_featured && (
            <Badge variant="outline" className="text-xs text-amber-600">
              Featured
            </Badge>
          )}
          {course.is_certificate && (
            <Badge variant="outline" className="text-xs text-blue-600">
              Certificate
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfo;
