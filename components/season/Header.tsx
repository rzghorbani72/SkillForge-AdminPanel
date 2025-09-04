import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';

const Header = ({ onCreate }: { onCreate: () => void }) => {
  const { selectedSchool } = useSchool();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
        <p className="text-muted-foreground">
          Manage seasons/modules for {selectedSchool?.name}
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Season
      </Button>
    </div>
  );
};

export default Header;
