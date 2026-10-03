import { useTranslation } from '@/lib/i18n/hooks';
import type { LegalPendingDocumentDiff } from '@/lib/api';

type Props = {
  entry: LegalPendingDocumentDiff;
};

export function LegalDocumentDiff({ entry }: Props) {
  const { t } = useTranslation();

  if (entry.previousVersion === null) {
    return <p className="mt-2 text-sm text-muted-foreground">{t('legal.firstTimeAcceptance')}</p>;
  }

  if (!entry.diff) {
    return <p className="mt-2 text-sm text-muted-foreground">{t('legal.diffUnavailable')}</p>;
  }

  const added = entry.diff.filter((part) => part.added);

  if (added.length === 0) {
    return <p className="mt-2 text-sm text-muted-foreground">{t('legal.onlyMinorChanges')}</p>;
  }

  return (
    <div className="beautiful-scrollbar mt-2 max-h-56 space-y-3 overflow-y-auto text-sm leading-relaxed">
      <p className="text-xs font-medium text-muted-foreground">{t('legal.whatChanged')}</p>
      <ChangeList title={t('legal.changesAdded')} lines={added} />
    </div>
  );
}

function ChangeList({ title, lines }: { title: string; lines: { value: string }[] }) {
  if (lines.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="mt-1 space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="text-foreground/90">
            {line.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
