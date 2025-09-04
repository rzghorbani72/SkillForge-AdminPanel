import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSchool } from '@/contexts/SchoolContext';

const Header = () => {
  const router = useRouter();
  const { selectedSchool } = useSchool();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          Manage courses for {selectedSchool?.name}
        </p>
      </div>
      <Button onClick={() => router.push('/courses/create')}>
        <Plus className="mr-2 h-4 w-4" />
        Create Course
      </Button>
    </div>
  );
};

export default Header;
