'use client';

import { Package, BookOpen, Tag, ToggleLeft, ToggleRight, Pencil, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Bundle } from './shared';

// ─── Bundle card ─────────────────────────────────────────────────────────────

export function BundleCard({
  bundle,
  onEdit,
  onToggle,
  onAssign,
  formatCurrency,
  t,
}: {
  bundle: Bundle;
  onEdit: () => void;
  onToggle: () => void;
  onAssign: () => void;
  formatCurrency: (n: number) => string;
  t: (k: string) => string;
}) {
  const courses = bundle.Courses?.map((bc) => bc.Course) ?? bundle.courses ?? [];

  return (
    <div className="flex flex-col rounded-xl border bg-card transition-colors hover:border-primary/40">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{bundle.title}</h3>
            <p className="font-mono text-xs text-muted-foreground">{bundle.slug}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={t('accessGrants.title')}
            onClick={onAssign}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <KeyRound className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t('bundles.editBundle')}
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={bundle.is_active ? t('bundles.inactive') : t('bundles.active')}
            onClick={onToggle}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            {bundle.is_active ? (
              <ToggleRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      {bundle.description && (
        <p className="mx-4 mb-2 line-clamp-2 text-sm text-muted-foreground">{bundle.description}</p>
      )}

      {/* Included courses */}
      {courses.length > 0 && (
        <div className="mx-4 mb-3 flex flex-wrap gap-1">
          {courses.map((c: any) => (
            <span
              key={c.id}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
            >
              <BookOpen className="h-3 w-3" />
              {c.title}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">{formatCurrency(bundle.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {courses.length} {t('bundles.courseCount')}
          </span>
          <Badge variant={bundle.is_active ? 'default' : 'secondary'} className="text-xs">
            {bundle.is_active ? t('bundles.active') : t('bundles.inactive')}
          </Badge>
        </div>
      </div>
    </div>
  );
}
