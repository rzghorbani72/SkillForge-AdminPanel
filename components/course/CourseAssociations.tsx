import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/api';

type Props = {
  course: Course;
};

const CourseAssociations = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Associations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <div className="text-sm">
              {course.category?.name || 'No Category'}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Season ID</label>
            <div className="text-sm">
              {course.seasons?.length
                ? course.seasons.length + ' seasons'
                : 'Not specified'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Audio ID</label>
            <div className="text-sm">{course.audio_id || 'Not specified'}</div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Video ID</label>
            <div className="text-sm">{course.video_id || 'Not specified'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseAssociations;
