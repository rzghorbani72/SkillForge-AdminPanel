'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CourseSearchCombobox } from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringEngagement } from '@/types/learning-operations';

interface TutoringEngagementsCardProps {
  engagements: TutoringEngagement[];
  loading: boolean;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export function TutoringEngagementsCard({
  engagements,
  loading,
  courseFilter,
  onCourseFilterChange,
  onRefresh,
}: TutoringEngagementsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tutoring.engagements')}</CardTitle>
        <CardDescription>{t('tutoring.engagementsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label>{t('tutoring.filterCourse')}</Label>
            <CourseSearchCombobox
              value={courseFilter}
              onValueChange={onCourseFilterChange}
              placeholder={t('tutoring.allCourses')}
              clearable
            />
          </div>
          <Button variant="outline" onClick={() => void onRefresh()}>
            {t('common.refresh')}
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-32 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : engagements.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('tutoring.noEngagements')}</p>
        ) : (
          <div className="space-y-3">
            {engagements.map((engagement) => (
              <div
                key={engagement.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {engagement.Course?.title ?? t('assignmentsPage.notAvailable')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {engagement.Student?.display_name ?? t('users.unnamedUser')} ↔{' '}
                    {engagement.Tutor?.display_name ?? t('users.unnamedUser')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{engagement.status}</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/tutoring/engagements/${engagement.id}`}>
                      {t('tutoring.openClass')}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
