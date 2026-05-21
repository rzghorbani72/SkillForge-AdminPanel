import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import { Course } from '@/types/api';

type Props = { course: Course };

const CourseCover = ({ course }: Props) => {
  const image = (course as any).Image || course.cover;
  const url = image?.publicUrl;
  const src = url
    ? url.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_HOST}${url}`
      : url
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
      </CardHeader>
      <CardContent>
        {src ? (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
            <img
              src={src}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full max-w-md flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
            <ImageIcon className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">No cover image</p>
            <p className="text-xs opacity-60">Edit the course to upload one</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCover;
