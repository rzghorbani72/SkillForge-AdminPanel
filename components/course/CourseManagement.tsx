import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit } from 'lucide-react';
import { Course } from '@/types/api';

type Props = {
  course: Course;
  onManageSeasons: () => void;
  onEdit: () => void;
};

const CourseManagement = ({ onManageSeasons, onEdit }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mb-4 text-sm text-muted-foreground">
            Manage your course content hierarchy: Course → Seasons → Lessons →
            Content
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="flex h-auto flex-col items-start p-4"
              onClick={onManageSeasons}
            >
              <div className="mb-2 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                <span className="font-medium">Manage Seasons</span>
              </div>
              <span className="text-left text-sm text-muted-foreground">
                Create and organize seasons within this course
              </span>
            </Button>

            <Button
              variant="outline"
              className="flex h-auto flex-col items-start p-4"
              onClick={onEdit}
            >
              <div className="mb-2 flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                <span className="font-medium">Edit Course</span>
              </div>
              <span className="text-left text-sm text-muted-foreground">
                Update course information and settings
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseManagement;
