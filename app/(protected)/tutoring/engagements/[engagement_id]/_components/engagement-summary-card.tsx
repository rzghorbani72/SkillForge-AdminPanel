'use client';

import { Badge } from '@/components/ui/badge';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { TutoringEngagement } from '@/types/learning-operations';

/** Who is being taught, by whom, and until when. */
export function EngagementSummaryCard({
  engagement
}: {
  engagement: TutoringEngagement;
}) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();

  const facts = [
    {
      label: t('tutoring.student'),
      value: engagement.Student?.display_name ?? t('users.unnamedUser')
    },
    {
      label: t('tutoring.tutor'),
      value: engagement.Tutor?.display_name ?? t('users.unnamedUser')
    },
    {
      label: t('tutoring.endsAt'),
      value: engagement.ends_at
        ? formatDate(engagement.ends_at)
        : t('tutoring.openEnded')
    }
  ];

  return (
    <DataPanel
      title={engagement.Course?.title ?? t('assignmentsPage.notAvailable')}
      subtitle={t('tutoring.engagementSummaryHint')}
      actions={<Badge variant="outline">{engagement.status}</Badge>}
    >
      <dl className="grid gap-4 p-5 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="font-semibold">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </DataPanel>
  );
}
