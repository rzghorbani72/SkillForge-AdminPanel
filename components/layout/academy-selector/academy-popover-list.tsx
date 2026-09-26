import type { Academy } from '@/types/api';
import { AcademyListItem } from './academy-list-item';

/** The scrollable, filtered list inside a switcher's popover — shared by the
 * manager and platform-admin variants, which differ only in whether a role
 * badge is shown per row. */
export function AcademyPopoverList({
  academies,
  selectedId,
  noResultsLabel,
  onSelect,
  getRoleLabel,
}: {
  academies: Academy[];
  selectedId?: string | null;
  noResultsLabel: string;
  onSelect: (id: string) => void;
  getRoleLabel?: (academy: Academy) => string;
}) {
  if (academies.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">{noResultsLabel}</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto py-1.5">
      {academies.map((academy) => (
        <AcademyListItem
          key={academy.id}
          academy={academy}
          isActive={selectedId === academy.id}
          roleLabel={getRoleLabel?.(academy)}
          onClick={() => onSelect(academy.id)}
        />
      ))}
    </div>
  );
}
