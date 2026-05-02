'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useAuthUser } from '@/hooks/useAuthUser';

export function StoreSelector() {
  const { academies, selectedAcademy, selectAcademy, isLoading } = useStore();
  const { user } = useAuthUser();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user is a platform-level admin
  const isPlatformAdmin = user?.isAdminProfile || user?.platformLevel || false;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (academies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No stores</span>
      </div>
    );
  }

  if (academies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{academies[0].name}</span>
      </div>
    );
  }

  // For platform-level admins, show disabled state
  if (isPlatformAdmin) {
    return (
      <div className="flex cursor-not-allowed items-center gap-2 px-3 py-2 opacity-50">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No Store Selected</span>
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
            {selectedAcademy?.name || 'Select Store'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {academies.map((academy) => (
          <DropdownMenuItem
            key={academy.id}
            onClick={() => {
              selectAcademy(academy.id);
              setIsOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <div>
                <div className="font-medium">{academy.name}</div>
                <div className="text-xs text-muted-foreground">
                  {academy.domain?.private_address}
                </div>
              </div>
            </div>
            {selectedAcademy?.id === academy.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
