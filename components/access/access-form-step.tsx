import type { ReactNode } from 'react';

type AccessFormStepProps = {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
};

/**
 * Numbers the "give access" form so a manager reads it as ordered steps
 * (who → how long → payment) instead of a flat wall of inputs.
 */
export function AccessFormStep({
  step,
  title,
  hint,
  children
}: AccessFormStepProps) {
  return (
    <section className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
          {step}
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium leading-none">{title}</p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
