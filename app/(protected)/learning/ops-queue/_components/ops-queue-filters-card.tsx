'use client';

import type { ReactNode } from 'react';
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
import { Badge } from '@/components/ui/badge';
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

interface OpsQueueFilterFieldProps {
  id: string;
  label: string;
  appliesTo: string;
  hint: string;
  children: ReactNode;
}

function OpsQueueFilterField({
  id,
  label,
  appliesTo,
  hint,
  children
}: OpsQueueFilterFieldProps) {
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Badge variant="outline" className="font-normal">
          {appliesTo}
        </Badge>
      </div>
      {children}
      <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
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
      <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <OpsQueueFilterField
          id="courseId"
          label={t('opsQueue.courseId')}
          appliesTo={t('opsQueue.filterAppliesAll')}
          hint={t('opsQueue.courseFilterHint')}
        >
          <CourseSearchCombobox
            id="courseId"
            value={courseId}
            onValueChange={onCourseIdChange}
            placeholder={t('opsQueue.courseIdPlaceholder')}
            clearable
          />
        </OpsQueueFilterField>

        <OpsQueueFilterField
          id="inactiveDays"
          label={t('opsQueue.inactiveDays')}
          appliesTo={t('opsQueue.inactivity')}
          hint={t('opsQueue.inactiveDaysHint')}
        >
          <Input
            id="inactiveDays"
            type="number"
            min={1}
            value={inactiveDays}
            aria-describedby="inactiveDays-hint"
            onChange={(event) => onInactiveDaysChange(event.target.value)}
          />
        </OpsQueueFilterField>

        <OpsQueueFilterField
          id="lowScore"
          label={t('opsQueue.lowScoreThreshold')}
          appliesTo={t('opsQueue.lowScores')}
          hint={t('opsQueue.lowScoreThresholdHint')}
        >
          <Input
            id="lowScore"
            type="number"
            min={0}
            value={lowScoreThreshold}
            aria-describedby="lowScore-hint"
            onChange={(event) => onLowScoreThresholdChange(event.target.value)}
          />
        </OpsQueueFilterField>

        <div className="flex flex-col justify-end gap-2">
          <Button onClick={() => void onRefresh()} className="w-full">
            {t('opsQueue.refresh')}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('opsQueue.refreshHint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
