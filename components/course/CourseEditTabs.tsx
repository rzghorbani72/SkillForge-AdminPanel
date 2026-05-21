'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Globe, EyeOff } from 'lucide-react';
import { Course } from '@/types/api';
import CourseCover from './CourseCover';
import CourseInfo from './CourseInfo';
import CoursePricing from './CoursePricing';
import CourseContent from './CourseContent';
import CoursePublishSettings from './CoursePublishSettings';
import { StatusBadge } from '@/components/shared/status-badge';

interface CourseEditTabsProps {
  course: Course;
  onManageSeasons: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function CourseEditTabs({
  course,
  onEdit,
  onBack
}: CourseEditTabsProps) {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.title}
              </h1>
              <StatusBadge
                status={course.is_published ? 'published' : 'draft'}
              />
            </div>
            {course.description && (
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant={course.is_published ? 'secondary' : 'default'}
          >
            {course.is_published ? (
              <>
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                Unpublish
              </>
            ) : (
              <>
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <CourseInfo course={course} />
          <CourseContent course={course} readOnly />
          <CourseCover course={course} />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <CoursePricing course={course} />
          <CoursePublishSettings course={course} />
        </div>
      </div>
    </div>
  );
}
