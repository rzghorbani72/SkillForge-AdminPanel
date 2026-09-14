import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  totalSteps: number;
  current: number; // 0-based index
}

export function StepIndicator({ totalSteps, current }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isDone = idx < current;
        const isActive = idx === current;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                isDone
                  ? 'bg-primary text-primary-foreground'
                  : isActive
                    ? 'border-2 border-primary text-primary'
                    : 'border-2 border-muted-foreground/30 text-muted-foreground/40',
              )}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div className={cn('h-px w-10', isDone ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
