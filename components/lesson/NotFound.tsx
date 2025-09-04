import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, Plus } from 'lucide-react';

const NotFound = ({
  searchTerm,
  router,
  courseId,
  seasonId
}: {
  searchTerm: string;
  router: any;
  courseId: string;
  seasonId: string;
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No lessons found</h3>
        <p className="mb-4 text-center text-muted-foreground">
          {searchTerm
            ? 'No lessons match your search criteria.'
            : "This season doesn't have any lessons yet."}
        </p>
        {!searchTerm && (
          <Button
            onClick={() =>
              router.push(
                `/courses/${courseId}/seasons/${seasonId}/lessons/create`
              )
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Lesson
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotFound;
