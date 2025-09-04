import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const SearchBar = ({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};

export default SearchBar;
