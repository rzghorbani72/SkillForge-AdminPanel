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
import { BookOpen, Clock, Edit, Eye, Plus, Trash2, Users } from 'lucide-react';
import { Course } from '@/types/api';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import CourseCover from './CourseCover';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';

type Props = {
  courses: Course[];
  searchTerm: string;
  onCreate?: () => void;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete?: (course: Course) => void;
};

const CoursesGrid = ({
  courses,
  searchTerm,
  onCreate,
  onView,
  onEdit,
  onDelete
}: Props) => {
  const school = useCurrentSchool();
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(
    null
  );

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete && onDelete) {
      onDelete(courseToDelete);
    }
    setCourseToDelete(null);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setCourseToDelete(null);
    }
  };

  const resultsLabel = `${courses.length} course${courses.length === 1 ? '' : 's'}`;
  const headerDescription = searchTerm
    ? `Showing ${resultsLabel} matching "${searchTerm}".`
    : `Showing ${resultsLabel}.`;

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
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => onView(course)}
            className="flex min-w-[300px] max-w-full flex-1 cursor-pointer flex-col gap-3 sm:max-w-[340px] lg:max-w-[380px] xl:max-w-[420px]"
          >
            <Card className="flex h-full w-full flex-col border-border/60 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {course.short_description || course.description}
                    </CardDescription>
                  </div>
                  {course.access_control && (
                    <AccessControlBadge
                      accessControl={course.access_control}
                      className="shrink-0 text-xs"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                <CourseCover course={course} />

                <div className="grid grid-cols-3 items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center justify-start gap-1">
                    <Users className="h-4 w-4" />
                    {course.students_count || 0}
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.lessons_count || 0}
                  </span>
                  {course.rating > 0 ? (
                    <span className="flex items-center justify-end gap-1">
                      ⭐ {course.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="flex items-center justify-end gap-1 text-muted-foreground/60">
                      No rating
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrencyWithSchool(course.price, school)}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  {course.access_control ? (
                    <AccessControlActions
                      accessControl={course.access_control}
                      onView={() => onView(course)}
                      onEdit={() => onEdit(course)}
                      onDelete={
                        onDelete ? () => handleDeleteClick(course) : undefined
                      }
                      className="w-full justify-between gap-2 sm:flex sm:w-auto"
                    />
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[110px] flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(course);
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[110px] flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(course);
                          }}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      {courseToDelete && (
        <ConfirmDeleteModal
          open={Boolean(courseToDelete)}
          onOpenChange={handleModalOpenChange}
          title={courseToDelete.title}
          itemType="course"
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default CoursesGrid;
