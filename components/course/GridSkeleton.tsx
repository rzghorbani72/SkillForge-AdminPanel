export function GridSkeleton() {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="aspect-video bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="mt-3 h-px bg-border" />
            <div className="flex justify-between pt-1">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
