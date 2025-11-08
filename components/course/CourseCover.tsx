import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Course } from '@/types/api';

type Props = {
  course: Course;
};

const CourseCover = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Cover</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full overflow-hidden rounded-lg border">
          <Image
            src={`${course.cover?.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST}${course.cover?.url}` : course.cover?.url}`}
            alt={course.title}
            className="h-full w-full object-contain"
            fill
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500"
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <div className="mb-2 text-4xl">📷</div>
              <div className="text-sm">Image not available</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCover;
