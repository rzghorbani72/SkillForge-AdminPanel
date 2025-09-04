import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/api';

type Props = {
  course: Course;
};

const CoursePublishSettings = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="text-base font-medium">Publish Course</div>
            <div className="text-sm text-gray-500">
              Make this course visible to students immediately
            </div>
          </div>
          <div className="flex items-center">
            <Badge variant={course.is_published ? 'default' : 'secondary'}>
              {course.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePublishSettings;
