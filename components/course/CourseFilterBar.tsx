'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface CourseFilterBarProps {
  categories: string[];
  category: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function CourseFilterBar({
  categories,
  category,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  view,
  onViewChange
}: CourseFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      {/* Category pill tabs */}
      <div className="inline-flex flex-wrap gap-1 rounded-full bg-muted/60 p-1">
        {['all', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${
              category === cat
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat === 'all' ? t('common.all') : cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            className="h-9 w-56 rounded-lg border border-border bg-background pe-9 ps-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            placeholder={t('courses.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* View toggle */}
        <div className="inline-flex gap-0.5 rounded-lg border border-border bg-background p-1">
          <button
            onClick={() => onViewChange('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              view === 'grid'
                ? 'bg-muted text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`rounded-md p-1.5 transition-colors ${
              view === 'list'
                ? 'bg-muted text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
