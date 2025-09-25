'use client';

import { useSchool } from '@/contexts/SchoolContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown } from 'lucide-react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function SchoolSelector() {
  const {
    selectedSchool,
    schools,
    isLoading,
    error,
    refreshSchools,
    setSelectedSchool
  } = useSchool();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">Error loading schools</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshSchools}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <Badge variant="secondary" className="text-xs">
          No schools available
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshSchools}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find((s) => s.id.toString() === schoolId);
    if (school) {
      console.log('Switching to school:', school);
      setSelectedSchool(school);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">School:</span>
      </div>

      <Select
        value={selectedSchool?.id.toString()}
        onValueChange={handleSchoolChange}
      >
        <SelectTrigger className="w-auto min-w-[180px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-medium">
                {selectedSchool?.name || 'Select School'}
              </Badge>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id.toString()}>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{school.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {school.domain?.private_address?.replace(
                    '.skillforge.com',
                    ''
                  ) || school.slug}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground">
        ({schools.length} school{schools.length !== 1 ? 's' : ''})
      </div>
    </div>
  );
}
