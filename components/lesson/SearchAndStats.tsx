'use client';

import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Lesson } from '@/types/api';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

const SearchAndStats = ({
  searchTerm,
  setSearchTerm,
  lessons
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  lessons: Lesson[];
}) => {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const publishedCount = lessons.filter((lesson) => lesson.is_published).length;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('courses.searchLessons')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold leading-none">
              {formatNumber(lessons.length)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('courses.totalLessons')}
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold leading-none">
              {formatNumber(publishedCount)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t('courses.activeLessons')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndStats;
