/** Ambient background wash: the three blurred colour fields behind the grid. */
export function DashboardGlow() {
  return (
    <>
      <div className="dashboard-glow dashboard-glow-1" />
      <div className="dashboard-glow dashboard-glow-2" />
      <div className="dashboard-glow dashboard-glow-3" />
    </>
  );
}

/** Layout-shaped placeholder while store or subscription is still resolving. */
export function DashboardSkeleton({ label }: { label: string }) {
  return (
    <div className="dashboard-shell flex-1">
      <DashboardGlow />
      <div className="relative space-y-6 p-4 sm:p-6" aria-label={label}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="shimmer h-6 w-24 rounded-full" />
            <div className="shimmer mt-2 h-8 w-56 rounded-lg" />
            <div className="shimmer mt-2 h-4 w-72 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="shimmer h-10 w-64 rounded-full" />
            <div className="shimmer h-10 w-32 rounded-full" />
          </div>
        </div>

        {/* Row 1: academy money cards */}
        <MoneyCardRowSkeleton />

        {/* Row 2: hero — two stat cards, the academy panel, two stat cards */}
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="hero-media order-first min-h-[220px] lg:order-none" />
          <div className="flex flex-col gap-4">
            {[2, 3].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Row 3: teacher money cards */}
        <MoneyCardRowSkeleton />

        {/* Row 4: money-flow chart + conversion funnel */}
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="dashboard-card shimmer h-[360px]" />
          <div className="dashboard-card shimmer h-[360px]" />
        </div>

        {/* Row 5: plan limits — a grid of quota bars, not a blank panel */}
        <div className="dashboard-card grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="shimmer h-3 w-28 rounded-full" />
              <div className="shimmer h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Row 6: course money table */}
        <TableSkeleton rows={3} />

        {/* Row 7: teacher money table + completion donut */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <TableSkeleton rows={4} />
          <div className="dashboard-card shimmer h-[300px]" />
        </div>
      </div>
    </div>
  );
}

/** One 4-up card row, matching MoneyCards' academy/teacher row layout. */
function MoneyCardRowSkeleton() {
  return (
    <div className="space-y-3">
      <div className="shimmer h-4 w-28 rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-card h-[190px]">
            <div className="shimmer h-10 w-10 rounded-2xl" />
            <div className="shimmer mt-4 h-3 w-24 rounded-full" />
            <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
            <div className="shimmer mt-2 h-3 w-32 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Matches DashboardHero's side stat cards (icon, label, value — no subtitle). */
function StatCardSkeleton() {
  return (
    <div className="stat-card h-[190px]">
      <div className="shimmer h-10 w-10 rounded-2xl" />
      <div className="shimmer mt-4 h-3 w-20 rounded-full" />
      <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
    </div>
  );
}

/** Header + a few rows, so a data table doesn't collapse into a blank card. */
function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="dashboard-card space-y-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="shimmer h-4 w-40 rounded-full" />
        <div className="shimmer h-8 w-32 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="shimmer h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
