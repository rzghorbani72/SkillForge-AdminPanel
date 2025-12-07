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
import { Store } from '@/types/api';
import { useStore } from '@/hooks/useStore';
import { getSelectedStoreId, setSelectedStoreId } from '@/lib/store-utils';

export function StoreSelector() {
  const { stores, selectedStore, selectStore, isLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">No stores</span>
      </div>
    );
  }

  if (stores.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{stores[0].name}</span>
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
            {selectedStore?.name || 'Select Store'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => {
              selectStore(store.id);
              setIsOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <div>
                <div className="font-medium">{store.name}</div>
                <div className="text-xs text-muted-foreground">
                  {store.domain?.private_address}
                </div>
              </div>
            </div>
            {selectedStore?.id === store.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
