'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import {
  FilterType,
  CategoryType,
  getCategoryTypeLabel
} from './category-utils';
import { useTranslation } from '@/lib/i18n/hooks';

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
  const { t } = useTranslation();

  return (
    <div
      className="fade-in-up flex flex-col gap-3 sm:flex-row sm:items-center"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="relative max-w-md flex-1">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('media.searchCategories')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-xl border-border/50 bg-background/50 pe-10 ps-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="h-10 w-full rounded-xl border-border/50 bg-background/50 sm:w-[180px]">
          <SelectValue placeholder={t('media.all')} />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectGroup>
            <SelectItem value="all" className="rounded-lg">
              {getCategoryTypeLabel('all')}
            </SelectItem>
            {Object.values(CategoryType).map((type: CategoryType) => (
              <SelectItem
                key={type}
                value={type.toString()}
                className="rounded-lg"
              >
                {getCategoryTypeLabel(type.toString())}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl border-border/50"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}
