import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Course } from '@/types/api';

type Props = {
  course: Course;
  onBack: () => void;
};

const EditHeader = ({ course, onBack }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
          <p className="text-muted-foreground">
            Update course information for {course.title}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditHeader;
