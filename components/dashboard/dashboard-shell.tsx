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
        <div className="space-y-2">
          <div className="shimmer h-4 w-24 rounded-full" />
          <div className="shimmer h-8 w-56 rounded-lg" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="stat-card h-[190px]">
                <div className="shimmer h-10 w-10 rounded-2xl" />
                <div className="shimmer mt-4 h-3 w-20 rounded-full" />
                <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="hero-media order-first min-h-[220px] lg:order-none" />
          <div className="flex flex-col gap-4">
            {[2, 3].map((i) => (
              <div key={i} className="stat-card h-[190px]">
                <div className="shimmer h-10 w-10 rounded-2xl" />
                <div className="shimmer mt-4 h-3 w-20 rounded-full" />
                <div className="shimmer mt-2 h-7 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="dashboard-card shimmer h-[360px]" />
          <div className="dashboard-card shimmer h-[360px]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="dashboard-card shimmer h-[300px]" />
          <div className="dashboard-card shimmer h-[300px]" />
        </div>
      </div>
    </div>
  );
}
