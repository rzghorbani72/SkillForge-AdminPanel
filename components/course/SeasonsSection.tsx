'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ChevronsDownUp, ChevronsUpDown, Clock, Plus } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/phone-utils';
import type { LessonDraft, SeasonDraft } from './useCourseForm';
import { secondsToDuration, sumDurationSeconds, type LessonType } from './course-drafts';
import { SortableSeasonAccordion } from './SortableSeasonAccordion';

interface SeasonsSectionProps {
  seasons: SeasonDraft[];
  lessons: LessonDraft[];
  onAddSeason: () => void;
  onRemoveSeason: (key: string) => void;
  onClearSeason: (key: string) => void;
  onUpdateSeason: (key: string, patch: Partial<Pick<SeasonDraft, 'title'>>) => void;
  onReorderSeasons: (from: number, to: number) => void;
  onAddLesson: (seasonClientKey: string, title: string, lessonType?: LessonType) => void;
  onRemoveLesson: (lessonKey: string) => void;
  onClearLesson: (lessonKey: string) => void;
  onUpdateLesson: (lessonKey: string, patch: Partial<LessonDraft>) => void;
  onAssignLesson: (lessonKey: string, seasonClientKey: string) => void;
  onReorderLessons: (sectionKey: string | undefined, from: number, to: number) => void;
}

export function SeasonsSection({
  seasons,
  lessons,
  onAddSeason,
  onRemoveSeason,
  onClearSeason,
  onUpdateSeason,
  onReorderSeasons,
  onAddLesson,
  onRemoveLesson,
  onClearLesson,
  onUpdateLesson,
  onAssignLesson,
  onReorderLessons,
}: SeasonsSectionProps) {
  const { t, language } = useTranslation();
  const seasonSensors = useSensors(useSensor(PointerSensor));
  const courseSeconds = useMemo(() => sumDurationSeconds(lessons), [lessons]);

  // Track open state for every season by clientKey (true = open)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const isOpen = useCallback(
    (key: string) => openMap[key] !== false, // default open
    [openMap],
  );

  function toggle(key: string) {
    setOpenMap((prev) => ({ ...prev, [key]: !isOpen(key) }));
  }

  const allOpen = seasons.every((s) => isOpen(s.clientKey));

  function toggleAll() {
    const next = !allOpen;
    setOpenMap(Object.fromEntries(seasons.map((s) => [s.clientKey, next])));
  }

  // "Empty" means no lessons — the same rule validateForPublish enforces.
  // Blocking here stops a wall of empty seasons that can never be published.
  const lastSeason = seasons[seasons.length - 1];
  const lastSeasonIsEmpty =
    lastSeason !== undefined && !lessons.some((l) => l.seasonClientKey === lastSeason.clientKey);

  function handleSeasonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = seasons.findIndex((s) => s.clientKey === active.id);
    const to = seasons.findIndex((s) => s.clientKey === over.id);
    if (from !== -1 && to !== -1) onReorderSeasons(from, to);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{t('courses.seasonsAndLessons')}</CardTitle>
          <p
            className={cn(
              'mt-0.5 text-xs',
              lastSeasonIsEmpty ? 'text-amber-600' : 'text-muted-foreground',
            )}
          >
            {lastSeasonIsEmpty ? t('courses.addSeasonBlocked') : t('courses.seasonsHint')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {courseSeconds > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs tabular-nums text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {t('courses.courseLength')}
              {': '}
              {language === 'fa'
                ? toPersianDigits(secondsToDuration(courseSeconds))
                : secondsToDuration(courseSeconds)}
            </span>
          )}
          {seasons.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={toggleAll}
            >
              {allOpen ? (
                <>
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                  {t('courses.collapseAll')}
                </>
              ) : (
                <>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  {t('courses.expandAll')}
                </>
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={lastSeasonIsEmpty}
            title={lastSeasonIsEmpty ? t('courses.addSeasonBlocked') : undefined}
            onClick={onAddSeason}
          >
            <Plus className="me-1.5 h-4 w-4" />
            {t('courses.addSeason')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {seasons.length === 0 ? (
          <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            {t('courses.addSeasonFirst')}
          </p>
        ) : (
          <DndContext
            sensors={seasonSensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleSeasonDragEnd}
          >
            <SortableContext
              items={seasons.map((s) => s.clientKey)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {seasons.map((season, si) => {
                  const seasonLessons = lessons.filter(
                    (l) => l.seasonClientKey === season.clientKey,
                  );
                  return (
                    <SortableSeasonAccordion
                      key={season.clientKey}
                      season={season}
                      index={si}
                      canRemove={seasons.length > 1}
                      lessons={seasonLessons}
                      allSeasons={seasons}
                      open={isOpen(season.clientKey)}
                      onToggle={() => toggle(season.clientKey)}
                      onUpdate={(patch) => onUpdateSeason(season.clientKey, patch)}
                      onRemove={() => onRemoveSeason(season.clientKey)}
                      onClear={() => onClearSeason(season.clientKey)}
                      onAddLesson={(title, lessonType) =>
                        onAddLesson(season.clientKey, title, lessonType)
                      }
                      onRemoveLesson={onRemoveLesson}
                      onClearLesson={onClearLesson}
                      onUpdateLesson={onUpdateLesson}
                      onAssignLesson={onAssignLesson}
                      onReorderLessons={(from, to) => onReorderLessons(season.clientKey, from, to)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
