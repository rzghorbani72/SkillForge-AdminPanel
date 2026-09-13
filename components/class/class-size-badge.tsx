'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/hooks';
import { CLASS_SIZE_LABEL, classSizeOf } from '@/lib/live-class-size';

/** Private / small group / public class — the tier a student is sold. */
export function ClassSizeBadge({ capacity }: { capacity: number }) {
  const { t } = useTranslation();
  return (
    <Badge variant="secondary" className="font-normal">
      {t(CLASS_SIZE_LABEL[classSizeOf(capacity)])}
    </Badge>
  );
}
