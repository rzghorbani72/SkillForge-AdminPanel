import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { LegalPendingDocumentDiff } from '@/lib/api';

type Props = {
  entry: LegalPendingDocumentDiff;
};

export function LegalDocumentDiff({ entry }: Props) {
  const { t } = useTranslation();

  if (entry.previousVersion === null) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        {t('legal.firstTimeAcceptance')}
      </p>
    );
  }

  if (!entry.diff) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        {t('legal.diffUnavailable')}
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t('legal.whatChanged')} (
        {t('legal.versionChange', {
          previous: entry.previousVersion,
          current: entry.version
        })}
        )
      </p>
      <div className="beautiful-scrollbar mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
        {entry.diff.map((part, i) => (
          <span
            key={i}
            className={cn(
              part.added &&
                'rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
              part.removed &&
                'rounded bg-rose-500/10 text-rose-700 line-through dark:text-rose-400'
            )}
          >
            {part.value}
          </span>
        ))}
      </div>
    </div>
  );
}
