'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSchool } from '@/hooks/useSchool';
import { useTranslation } from '@/lib/i18n/hooks';

const Header = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedSchool } = useSchool();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('courses.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('courses.manageCoursesFor')} {selectedSchool?.name}
        </p>
      </div>
      <Button onClick={() => router.push('/courses/create')}>
        <Plus className="mr-2 h-4 w-4" />
        {t('courses.createCourse')}
      </Button>
    </div>
  );
};

export default Header;
