export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
