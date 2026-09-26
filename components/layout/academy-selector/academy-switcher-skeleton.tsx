import { Loader2 } from 'lucide-react';

/** Loading placeholder shown while academies are fetched, or briefly while a
 * manager's switch to another academy is in flight. */
export function AcademySwitcherSkeleton({ switching }: { switching: boolean }) {
  return (
    <div className="flex h-9 w-9 shrink-0 animate-pulse items-center gap-2.5 rounded-xl bg-muted sm:h-10 sm:w-48 sm:px-3">
      <div className="hidden h-8 w-8 rounded-lg bg-muted-foreground/20 sm:block" />
      <div className="hidden flex-col gap-1 sm:flex">
        <div className="h-3 w-24 rounded bg-muted-foreground/20" />
        <div className="h-2.5 w-32 rounded bg-muted-foreground/15" />
      </div>
      {switching && <Loader2 className="ms-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  );
}
