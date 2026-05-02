'use client';

import { useStore } from '@/hooks/useStore';
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

export function StoreSelector() {
  const {
    selectedAcademy,
    academies,
    isLoading,
    error,
    refreshAcademies,
    selectAcademy
  } = useStore();

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
        <span className="text-sm text-destructive">Error loading stores</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshAcademies}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (academies.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <Badge variant="secondary" className="text-xs">
          No stores available
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshAcademies}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const handleStoreChange = (academyId: string) => {
    const academy = academies.find((s) => s.id.toString() === academyId);
    if (academy) {
      selectAcademy(academy.id);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Store:</span>
      </div>

      <Select
        value={selectedAcademy?.id.toString()}
        onValueChange={handleStoreChange}
      >
        <SelectTrigger className="w-auto min-w-[180px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="font-medium">
                {selectedAcademy?.name || 'Select Store'}
              </Badge>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {academies.map((academy) => (
            <SelectItem key={academy.id} value={academy.id.toString()}>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{academy.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {academy.domain?.private_address?.replace(
                    '.skillforge.com',
                    ''
                  ) || academy.slug}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground">
        ({academies.length} {academies.length === 1 ? 'academy' : 'academies'})
      </div>
    </div>
  );
}
