'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/lib/i18n/hooks';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useStore();

  return (
    <div className="fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="icon-container-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('courses.title')}
            </h1>
            <Badge
              variant="secondary"
              className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary sm:flex"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('courses.manageCoursesFor')} {selectedStore?.name}
          </p>
        </div>
      </div>
      <Button
        onClick={() => router.push('/courses/create')}
        className="gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
      >
        <Plus className="h-4 w-4" />
        {t('courses.createCourse')}
      </Button>
    </div>
  );
};

export default Header;
