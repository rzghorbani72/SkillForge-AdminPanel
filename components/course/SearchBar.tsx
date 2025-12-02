'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

const SearchBar = ({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="fade-in-up flex items-center gap-3"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('courses.searchCourses')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-xl border-border/50 bg-background/50 pl-10 pr-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl border-border/50"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SearchBar;
