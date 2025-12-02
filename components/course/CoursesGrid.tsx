'use client';

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
import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  Plus,
  Star,
  Trash2,
  Users
} from 'lucide-react';
import { Course } from '@/types/api';
import {
  AccessControlBadge,
  AccessControlActions
} from '@/components/ui/access-control-badge';
import CourseCover from './CourseCover';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { formatCurrencyWithSchool } from '@/lib/utils';
import { useCurrentSchool } from '@/hooks/useCurrentSchool';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation();
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

  const headerDescription = searchTerm
    ? t('courses.showingMatching', { count: courses.length, term: searchTerm })
    : t('courses.showingCount', { count: courses.length });

  if (courses.length === 0) {
    return (
      <div
        className="fade-in-up flex flex-1 items-center justify-center p-6"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 text-muted-foreground shadow-sm">
              <BookOpen className="h-10 w-10" />
            </div>
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {t('courses.noCourses')}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {searchTerm
              ? t('courses.noCoursesMatch', { term: searchTerm })
              : t('courses.getStarted')}
          </p>
          {!searchTerm && onCreate && (
            <Button
              onClick={onCreate}
              className="mt-6 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              {t('courses.createCourse')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fade-in-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: '0.15s' }}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('courses.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{headerDescription}</p>
        </div>
      </div>

      <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course, index) => (
          <div
            key={course.id}
            onClick={() => onView(course)}
            className="cursor-pointer"
            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
          >
            <Card
              className={cn(
                'group flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300',
                'hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
              )}
            >
              {/* Course Cover */}
              <div className="relative overflow-hidden">
                <CourseCover course={course} />
                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Featured badge */}
                {course.is_featured && (
                  <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-amber-500/90 text-white backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    {t('courses.featured')}
                  </Badge>
                )}
                {/* Price badge */}
                <div className="absolute bottom-3 right-3">
                  {course.price && course.price > 0 ? (
                    <Badge className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-foreground backdrop-blur-sm dark:bg-black/90 dark:text-white">
                      {formatCurrencyWithSchool(course.price, school)}
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-emerald-500/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                      {t('courses.free')}
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {course.short_description || course.description}
                    </CardDescription>
                  </div>
                  {course.access_control && (
                    <AccessControlBadge
                      accessControl={course.access_control}
                      className="shrink-0 text-[10px]"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                {/* Stats row */}
                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {course.students_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {course.lessons_count || 0} lessons
                    </span>
                  </div>
                  {course.rating > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground/60">—</div>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={course.is_published ? 'default' : 'secondary'}
                    className={cn(
                      'rounded-full text-[10px] font-semibold',
                      course.is_published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {course.is_published
                      ? t('courses.published')
                      : t('courses.draft')}
                  </Badge>
                </div>

                {/* Action buttons */}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  {course.access_control ? (
                    <AccessControlActions
                      accessControl={course.access_control}
                      onView={() => onView(course)}
                      onEdit={() => onEdit(course)}
                      onDelete={
                        onDelete ? () => handleDeleteClick(course) : undefined
                      }
                      className="flex w-full justify-between gap-2"
                    />
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(course);
                        }}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-border/50 text-xs hover:border-primary/50 hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(course);
                        }}
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 rounded-lg border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(course);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
