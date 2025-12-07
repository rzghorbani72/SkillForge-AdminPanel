import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useCurrentStore } from '@/hooks/useCurrentStore';

type Props = {
  course: Course;
};

const CoursePricing = ({ course }: Props) => {
  const store = useCurrentStore();

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
              {formatCurrencyWithStore(course.price || 0, store)}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Secondary Price
            </label>
            <div className="text-lg font-medium">
              {formatCurrencyWithStore(course.original_price || 0, store)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursePricing;
