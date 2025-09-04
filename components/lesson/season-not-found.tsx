import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

const SeasonNotFound = ({
  router,
  courseId
}: {
  router: any;
  courseId: string;
}) => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Season Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The season you're looking for doesn't exist.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/courses/${courseId}/seasons`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Seasons
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeasonNotFound;
