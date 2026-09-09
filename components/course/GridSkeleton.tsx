import { COURSE_CARD_GRID_COLUMNS } from './courseUtils';

export function GridSkeleton() {
  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: COURSE_CARD_GRID_COLUMNS }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="aspect-video bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="mt-2 grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-3">
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-8 flex-1 rounded-md bg-muted" />
              <div className="h-8 flex-1 rounded-md bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
