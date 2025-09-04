import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/api';

type Props = {
  course: Course;
};

const CourseInfo = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Course Title</label>
          <div className="text-lg font-medium">{course.title}</div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {course.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfo;
