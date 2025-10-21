import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CategoryHeaderProps {
  onCreateClick: () => void;
}

export function CategoryHeader({ onCreateClick }: CategoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage categories for courses and content
        </p>
      </div>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Create Category
      </Button>
    </div>
  );
}
