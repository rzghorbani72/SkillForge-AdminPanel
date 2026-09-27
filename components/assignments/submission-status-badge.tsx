import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import type { SubmissionStatus } from '@/types/learning-operations';

const STATUS_CLASS: Partial<Record<SubmissionStatus, string>> = {
  GRADED: 'bg-green-100 text-green-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const { t } = useTranslation();
  return (
    <Badge className={STATUS_CLASS[status] ?? 'bg-muted text-muted-foreground'}>
      {t(`learningOperations.status.${status}`)}
    </Badge>
  );
}
