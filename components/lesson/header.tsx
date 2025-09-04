import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Course, Season } from '@/types/api';

const LessonHeader = ({
  courseId,
  seasonId,
  season,
  course,
  router
}: {
  courseId: string;
  seasonId: string;
  season: Season;
  course: Course;
  router: any;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/courses/${courseId}/seasons/${seasonId}`)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Season
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lessons Management</h1>
          <p className="text-muted-foreground">
            Manage lessons for "{season.title}" in "{course.title}"
          </p>
        </div>
      </div>
      <Button
        onClick={() =>
          router.push(`/courses/${courseId}/seasons/${seasonId}/lessons/create`)
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Lesson
      </Button>
    </div>
  );
};

export default LessonHeader;
