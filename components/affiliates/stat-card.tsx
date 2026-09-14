import { ArrowUp } from 'lucide-react';

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <ArrowUp className="h-3 w-3" />
            {delta}٪
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
