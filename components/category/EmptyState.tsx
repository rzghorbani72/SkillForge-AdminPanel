import { Folder } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  selectedType: string;
}

export function EmptyState({ searchTerm, selectedType }: EmptyStateProps) {
  return (
    <div className="col-span-full py-12 text-center">
      <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
      <p className="mt-2 text-muted-foreground">
        {searchTerm || selectedType !== 'all'
          ? 'Try adjusting your search or filter criteria.'
          : 'Get started by creating your first category.'}
      </p>
    </div>
  );
}
