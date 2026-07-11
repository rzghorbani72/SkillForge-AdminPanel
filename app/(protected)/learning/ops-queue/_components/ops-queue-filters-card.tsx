'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CourseSearchCombobox } from '@/components/entity-search';
import { useTranslation } from '@/lib/i18n/hooks';

interface OpsQueueFiltersCardProps {
  courseId: string;
  onCourseIdChange: (value: string) => void;
  inactiveDays: string;
  onInactiveDaysChange: (value: string) => void;
  lowScoreThreshold: string;
  onLowScoreThresholdChange: (value: string) => void;
  onRefresh: () => void;
}

export function OpsQueueFiltersCard({
  courseId,
  onCourseIdChange,
  inactiveDays,
  onInactiveDaysChange,
  lowScoreThreshold,
  onLowScoreThresholdChange,
  onRefresh
}: OpsQueueFiltersCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('opsQueue.filters')}</CardTitle>
        <CardDescription>{t('opsQueue.filtersDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="courseId">{t('opsQueue.courseId')}</Label>
          <CourseSearchCombobox
            id="courseId"
            value={courseId}
            onValueChange={onCourseIdChange}
            placeholder={t('opsQueue.courseIdPlaceholder')}
            clearable
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inactiveDays">{t('opsQueue.inactiveDays')}</Label>
          <Input
            id="inactiveDays"
            type="number"
            min={1}
            value={inactiveDays}
            onChange={(event) => onInactiveDaysChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lowScore">{t('opsQueue.lowScoreThreshold')}</Label>
          <Input
            id="lowScore"
            type="number"
            min={0}
            value={lowScoreThreshold}
            onChange={(event) => onLowScoreThresholdChange(event.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={() => void onRefresh()} className="w-full">
            {t('opsQueue.refresh')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
