import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock } from 'lucide-react';
import { Play } from 'lucide-react';
import { Video } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Lesson } from '@/types/api';

const index = ({
  lesson,
  router,
  courseId,
  seasonId,
  handleDeleteLesson
}: {
  lesson: Lesson;
  router: any;
  courseId: string;
  seasonId: string;
  handleDeleteLesson: (id: number) => void;
}) => {
  return (
    <Card key={lesson.id} className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{lesson.title}</CardTitle>
            <CardDescription className="mt-1">
              {lesson.description || 'No description provided'}
            </CardDescription>
          </div>
          <Badge variant={lesson.is_active ? 'default' : 'secondary'}>
            {lesson.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {lesson.duration || 'N/A'}
            </span>
            <span className="flex items-center">
              <Play className="mr-1 h-4 w-4" />
              Order: {lesson.order || 'N/A'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Video className="mr-1 h-4 w-4" />
              {lesson.media_id ? 'Media' : 'No Media'}
            </span>
            <span className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              {lesson.content ? 'Content' : 'No Content'}
            </span>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                router.push(
                  `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}`
                )
              }
            >
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                router.push(
                  `/courses/${courseId}/seasons/${seasonId}/lessons/${lesson.id}/edit`
                )
              }
            >
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the lesson "{lesson.title}" and all its associated content.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default index;
