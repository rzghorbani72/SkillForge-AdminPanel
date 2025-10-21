'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { School } from '@/types/api';
import { useSchool } from '@/hooks/useSchool';
import { getSelectedSchoolId, setSelectedSchoolId } from '@/lib/school-utils';

export function SchoolSelector() {
  const { schools, selectedSchool, selectSchool, isLoading } = useSchool();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No schools</span>
      </div>
    );
  }

  if (schools.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{schools[0].name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-3 py-2"
        >
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedSchool?.name || 'Select School'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => {
              selectSchool(school.id);
              setIsOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <div>
                <div className="font-medium">{school.name}</div>
                <div className="text-xs text-muted-foreground">
                  {school.domain?.private_address}
                </div>
              </div>
            </div>
            {selectedSchool?.id === school.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
