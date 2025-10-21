import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Folder } from 'lucide-react';
import { FilterType } from './category-utils';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: FilterType;
  onTypeChange: (type: FilterType) => void;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
          <Folder className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="COURSE">Course</SelectItem>
          <SelectItem value="ARTICLE">Article</SelectItem>
          <SelectItem value="BLOG">Blog</SelectItem>
          <SelectItem value="NEWS">News</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
