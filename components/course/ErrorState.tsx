import React from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  onBack: () => void;
};

const ErrorState = ({ onBack }: Props) => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Course Not Found
          </h2>
          <p className="text-muted-foreground">
            The course you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={onBack} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
