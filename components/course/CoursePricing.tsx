import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/api';
import { formatCurrencyWithStore } from '@/lib/utils';
import { useCurrentAcademy } from '@/hooks/useCurrentAcademy';

type Props = { course: Course };

const CoursePricing = ({ course }: Props) => {
  const currentAcademy = useCurrentAcademy();

  const discount =
    course.discount_percent ??
    (course.original_price &&
    course.price &&
    course.original_price > course.price
      ? Math.round(
          ((course.original_price - course.price) / course.original_price) * 100
        )
      : null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {course.is_free ? (
          <Badge
            variant="outline"
            className="border-emerald-300 text-sm text-emerald-600"
          >
            Free Course
          </Badge>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-0.5 text-xs text-muted-foreground">Price</p>
              <p className="text-xl font-semibold">
                {formatCurrencyWithStore(course.price || 0, currentAcademy)}
              </p>
            </div>
            {course.original_price != null && course.original_price > 0 && (
              <div>
                <p className="mb-0.5 text-xs text-muted-foreground">Original</p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrencyWithStore(
                    course.original_price,
                    currentAcademy
                  )}
                </p>
              </div>
            )}
            {discount != null && discount > 0 && (
              <Badge variant="destructive" className="mb-0.5 text-xs">
                -{discount}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursePricing;
