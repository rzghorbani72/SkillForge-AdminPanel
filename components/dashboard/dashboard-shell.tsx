/** Ambient background wash — kept for layout compatibility; glow is disabled in CSS. */
export function DashboardGlow() {
  return null;
}

/** Layout-shaped placeholder while store or subscription is still resolving. */
export function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div className="dashboard-shell flex-1">
      <div className="relative space-y-6 p-4 sm:p-6" aria-label={label}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="shimmer h-6 w-24 rounded-full" />
            <div className="shimmer mt-2 h-8 w-56 rounded-lg" />
            <div className="shimmer mt-2 h-4 w-72 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="shimmer h-10 w-64 rounded-lg" />
            <div className="shimmer h-10 w-32 rounded-lg" />
          </div>
        </div>

        <MoneyCardRowSkeleton />

        <div className="space-y-3">
          <div className="shimmer h-4 w-28 rounded-full" />
          <div className="grid gap-3 lg:grid-cols-[0.85fr_1fr_0.85fr]">
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="dashboard-card order-first aspect-[5/4] lg:order-none" />
            <div className="flex flex-col gap-3">
              {[2, 3].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <MoneyCardRowSkeleton />

        <div className="space-y-3">
          <div className="shimmer h-4 w-24 rounded-full" />
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="dashboard-card shimmer h-[320px]" />
            <div className="dashboard-card shimmer h-[320px]" />
          </div>
          <div className="dashboard-card shimmer h-[280px]" />
        </div>

        <div className="dashboard-card grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="shimmer h-3 w-28 rounded-full" />
              <div className="shimmer h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        <TableSkeleton rows={3} />
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}

function MoneyCardRowSkeleton() {
  return (
    <div className="space-y-3">
      <div className="shimmer h-4 w-28 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-start gap-3">
        <div className="shimmer h-9 w-9 rounded-lg" />
        <div className="shimmer mt-1.5 h-3 w-24 rounded-full" />
      </div>
      <div className="shimmer mt-3 h-7 w-28 rounded-md" />
      <div className="shimmer mt-2 h-3 w-32 rounded-full" />
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="dashboard-card space-y-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="shimmer h-4 w-40 rounded-full" />
        <div className="shimmer h-8 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="shimmer h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
