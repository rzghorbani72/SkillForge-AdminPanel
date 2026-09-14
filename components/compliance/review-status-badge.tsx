'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  CONTENT_REVIEW_STATUS,
  ENAMAD_STATUS,
  type ContentReviewStatus,
  type EnamadStatus,
} from '@/types/compliance';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const REVIEW_VARIANT: Record<ContentReviewStatus, BadgeVariant> = {
  [CONTENT_REVIEW_STATUS.PENDING]: 'secondary',
  [CONTENT_REVIEW_STATUS.APPROVED]: 'default',
  [CONTENT_REVIEW_STATUS.FLAGGED]: 'destructive',
  [CONTENT_REVIEW_STATUS.SUSPENDED]: 'destructive',
};

const ENAMAD_VARIANT: Record<EnamadStatus, BadgeVariant> = {
  [ENAMAD_STATUS.NOT_REQUIRED]: 'outline',
  [ENAMAD_STATUS.REQUIRED]: 'secondary',
  [ENAMAD_STATUS.PENDING]: 'secondary',
  [ENAMAD_STATUS.VERIFIED]: 'default',
  [ENAMAD_STATUS.REJECTED]: 'destructive',
};

export function ReviewStatusBadge({ status }: { status: ContentReviewStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={REVIEW_VARIANT[status] ?? 'outline'}>
      {t(`compliance.reviewStatus.${status}`)}
    </Badge>
  );
}

export function EnamadStatusBadge({ status }: { status: EnamadStatus }) {
  const { t } = useTranslation();
  return (
    <Badge variant={ENAMAD_VARIANT[status] ?? 'outline'}>
      {t(`compliance.enamadStatus.${status}`)}
    </Badge>
  );
}
