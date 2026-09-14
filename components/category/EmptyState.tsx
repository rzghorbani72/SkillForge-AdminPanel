import { Folder } from 'lucide-react';
import { MESSAGES } from '@/constants/messages';

interface EmptyStateProps {
  searchTerm: string;
  selectedType: string;
}

export function EmptyState({ searchTerm, selectedType }: EmptyStateProps) {
  const isFiltered = searchTerm || selectedType !== 'all';

  return (
    <div className="col-span-full py-12 text-center">
      <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{MESSAGES.category.noCategoriesFound}</h3>
      <p className="mt-2 text-muted-foreground">
        {isFiltered ? MESSAGES.category.adjustSearch : MESSAGES.category.createFirstCategory}
      </p>
    </div>
  );
}
