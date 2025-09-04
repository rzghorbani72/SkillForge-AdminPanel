import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/api';

type Props = {
  course: Course;
};

const CoursePricing = ({ course }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Primary Price
            </label>
            <div className="text-lg font-medium">
              ${course.price ? (course.price / 100).toFixed(2) : '0.00'}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Secondary Price
            </label>
            <div className="text-lg font-medium">
              $
              {course.original_price
                ? (course.original_price / 100).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePricing;
