'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  BookOpen,
  Play,
  Plus,
  GripVertical,
  Pencil,
  MoreHorizontal,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/hooks';
import { apiClient } from '@/lib/api';
import { StatusPill } from './StatusPill';
import { courseHue, formatNumber, pricingTypeLabel } from './courseUtils';
import type { CourseWithRevenue } from './useCourses';

type DrawerTab = 'content' | 'pricing' | 'access' | 'settings';

type SeasonWithLessons = {
  id: number;
  title: string;
  order: number;
  lessons: {
    id: number;
    title: string;
    duration?: string;
    is_free?: boolean;
  }[];
};

export function CourseDrawer({
  course,
  onClose,
  onEdit
}: {
  course: CourseWithRevenue;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const hue = courseHue(course.id);
  const teacher =
    (course as any).teacher_name ??
    (course as any).Teacher?.display_name ??
    '—';
  const priceVal = (course as any).primary_price ?? 0;
  const pricingType = (course as any).pricing_type ?? 'ONE_TIME';

  const [activeTab, setActiveTab] = useState<DrawerTab>('content');
  const [seasons, setSeasons] = useState<SeasonWithLessons[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    setLoadingSeasons(true);
    apiClient
      .getSeasons(course.id)
      .then((raw: any) => {
        const list: any[] = Array.isArray(raw)
          ? raw
          : (raw?.seasons ?? raw?.data ?? []);
        setSeasons(
          list.map((s: any) => ({
            id: s.id,
            title: s.title,
            order: s.order ?? 0,
            lessons: s.lessons ?? []
          }))
        );
        if (list.length > 0) {
          setExpandedSeasons(new Set([list[0].id]));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSeasons(false));
  }, [course.id]);

  function toggleSeason(id: number) {
    setExpandedSeasons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'content', label: t('courses.content') },
    { key: 'pricing', label: t('courses.pricing') },
    { key: 'access', label: t('courses.tabAccess') },
    { key: 'settings', label: t('courses.tabSettings') }
  ];

  function pricingTypeLabel() {
    if (pricingType === 'FREE') return t('courses.free');
    if (pricingType === 'ONE_TIME') return t('courses.oneTimePayment');
    if (pricingType === 'SUBSCRIPTION') return t('courses.subscriptionPlan');
    return t('courses.installmentPlan');
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="absolute bottom-0 end-0 top-0 flex w-[min(480px,90vw)] flex-col border-s border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {(course as any).category ?? t('courses.course')}
            </span>
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mb-2 text-start text-[17px] font-bold leading-snug">
            {course.title}
          </h2>
          <div className="flex flex-wrap items-center justify-start gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold [background:var(--avatar-bg)] [color:var(--avatar-color)]"
                style={
                  {
                    '--avatar-bg': `hsl(${hue} 80% 90%)`,
                    '--avatar-color': `hsl(${hue} 60% 38%)`
                  } as React.CSSProperties
                }
              >
                {teacher.charAt(0)}
              </span>
              {teacher}
            </span>
            {(course as any).duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {(course as any).duration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {(course as any).seasons_count ?? seasons.length}{' '}
              {t('courses.season')}
            </span>
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {(course as any).lessons_count ?? 0} {t('courses.lesson')}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-[12.5px] font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'content' && (
            <div className="p-4">
              {loadingSeasons ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              ) : seasons.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-muted-foreground">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p>{t('courses.noSeasonsAdded')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {seasons.map((season) => {
                    const expanded = expandedSeasons.has(season.id);
                    return (
                      <div
                        key={season.id}
                        className="overflow-hidden rounded-xl border border-border bg-background"
                      >
                        <div className="flex items-center gap-2 px-3 py-3">
                          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/40" />
                          <button
                            type="button"
                            className="flex flex-1 items-center justify-between text-start"
                            onClick={() => toggleSeason(season.id)}
                          >
                            <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                              {season.title}
                              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10.5px] font-normal text-muted-foreground">
                                {season.lessons.length} {t('courses.lesson')}
                              </span>
                            </div>
                            {expanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label={t('common.edit')}
                            className="rounded p-1 text-muted-foreground hover:bg-muted/60"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={t('common.actions')}
                            className="rounded p-1 text-muted-foreground hover:bg-muted/60"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={t('courses.removeSeason')}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {expanded && (
                          <div className="border-t border-border/60">
                            {season.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5 last:border-0 hover:bg-muted/20"
                              >
                                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/30" />
                                <Play className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                                <span className="flex-1 text-[12.5px]">
                                  {lesson.title}
                                </span>
                                {lesson.is_free && (
                                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary">
                                    {t('courses.previewBadge')}
                                  </span>
                                )}
                                {lesson.duration && (
                                  <span className="font-mono text-[11px] text-muted-foreground">
                                    {lesson.duration}
                                  </span>
                                )}
                              </div>
                            ))}
                            {season.lessons.length === 0 && (
                              <div className="px-4 py-3 text-[12px] text-muted-foreground">
                                {t('courses.noLessonsInSeason')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => onEdit()}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                {t('courses.addSeason')}
              </button>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('courses.pricingInfo')}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">
                      {t('courses.pricingType')}
                    </span>
                    <span className="font-medium">{pricingTypeLabel()}</span>
                  </div>
                  {priceVal > 0 && (
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground">
                        {t('courses.price')}
                      </span>
                      <span className="font-mono font-semibold text-primary">
                        {formatNumber(priceVal)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">
                      {t('courses.revenue')}
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(course.revenue ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('courses.accessStatus')}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">
                      {t('common.status')}
                    </span>
                    <StatusPill status={(course as any).status ?? 'DRAFT'} />
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">
                      {t('courses.students')}
                    </span>
                    <span className="font-mono font-semibold">
                      {formatNumber(course.enrollments_count ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-3 p-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
                {t('courses.editCourse')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={onEdit}
              >
                <BookOpen className="h-4 w-4" />
                {t('courses.viewCourse')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
