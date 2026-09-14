'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import type { TutoringGroupStatus } from '@/types/learning-operations';

const VARIANT: Record<TutoringGroupStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'outline',
  WAITING: 'secondary',
  CONFIRMED: 'default',
  RUNNING: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'destructive',
};

export const GroupStatusBadge = ({ status }: { status: TutoringGroupStatus }) => {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status] ?? 'outline'}>{t(`tutoring.groups.status.${status}`)}</Badge>
  );
};
