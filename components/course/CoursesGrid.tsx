import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Edit, Eye, Plus, Users } from 'lucide-react';
import { Course } from '@/types/api';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';

type Props = {
  courses: Course[];
  searchTerm: string;
  onCreate?: () => void;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
};

const CoursesGrid = ({
  courses,
  searchTerm,
  onCreate,
  onView,
  onEdit
}: Props) => {
  if (courses.length === 0) {
    return (
      <Card className="py-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No courses found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchTerm
            ? `No courses match "${searchTerm}"`
            : 'Get started by creating your first course.'}
        </p>
        {!searchTerm && onCreate && (
          <Button onClick={onCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <Card key={course.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-2 text-lg">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {course.short_description || course.description}
                </CardDescription>
              </div>
              {/* Access Control Badge */}
              {course.access_control && (
                <div className="ml-2">
                  <AccessControlBadge
                    accessControl={course.access_control}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {course.students_count || 0}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {course.lessons_count || 0}
                </span>
                {course.rating > 0 && (
                  <span className="flex items-center">
                    ⭐ {course.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Badge
                    variant={course.is_published ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {course.is_featured && (
                    <Badge
                      variant="outline"
                      className="border-yellow-600 text-xs text-yellow-600"
                    >
                      Featured
                    </Badge>
                  )}
                </div>
                {course.price && course.price > 0 ? (
                  <span className="text-sm font-medium">
                    ${(course.price / 100).toFixed(2)}
                  </span>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Free
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {course.access_control ? (
                  <AccessControlActions
                    accessControl={course.access_control}
                    onView={() => onView(course)}
                    onEdit={() => onEdit(course)}
                    onDelete={() => console.log('Delete course', course.id)}
                    className="flex-1"
                  />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onView(course)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(course)}
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CoursesGrid;
