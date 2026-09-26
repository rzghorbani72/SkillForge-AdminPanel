'use client';

import { AcademyStatusPill } from '@/components/academies/academy-helpers';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Academy } from '@/types/api';

export function AcademyStatusBadge({
  academy,
  dotOnly = false,
}: {
  academy: Academy;
  dotOnly?: boolean;
}) {
  const { t } = useTranslation();
  return <AcademyStatusPill academy={academy} dotOnly={dotOnly} t={t} />;
}
