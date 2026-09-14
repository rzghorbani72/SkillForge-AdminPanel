'use client';

import Link from 'next/link';
import { ArrowRightLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useTranslation } from '@/lib/i18n/hooks';
import { useDateFormat } from '@/lib/i18n/use-date-format';
import type { TutoringEngagement } from '@/types/learning-operations';

/** Who is being taught, by whom, and until when. */
export function EngagementSummaryCard({ engagement }: { engagement: TutoringEngagement }) {
  const { t } = useTranslation();
  const formatDate = useDateFormat();
  const formatCurrency = useFormatCurrency();

  const facts = [
    {
      label: t('tutoring.student'),
      value: engagement.Student?.display_name ?? t('users.unnamedUser'),
    },
    {
      label: t('tutoring.tutor'),
      value: engagement.Tutor?.display_name ?? t('users.unnamedUser'),
    },
    {
      label: t('tutoring.endsAt'),
      value: engagement.ends_at ? formatDate(engagement.ends_at) : t('tutoring.openEnded'),
    },
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
      {engagement.moved_to_group_id ? (
        <p className="mx-5 mb-5 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {t('tutoring.movedBanner', {
              title: engagement.Group?.title ?? '',
              amount: formatCurrency(engagement.credit_granted ?? 0),
            })}{' '}
            <Link
              href={`/courses/${engagement.course_id}/live/${engagement.moved_to_group_id}`}
              className="font-medium underline"
            >
              {t('tutoring.groups.openFullPage')}
            </Link>
          </span>
        </p>
      ) : null}
    </DataPanel>
  );
}
