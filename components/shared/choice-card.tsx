import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconBox } from './icon-box';

type ChoiceCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  icon?: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

/** A radio-style option card: the whole card is the button. Wrap a set in `role="radiogroup"`. */
export function ChoiceCard({
  selected,
  onSelect,
  title,
  hint,
  icon,
  badge,
  disabled,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border-[1.5px] p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-[3px] h-5 w-5 shrink-0 rounded-full bg-card',
          selected ? 'border-[6px] border-primary' : 'border-2 border-muted-foreground/60',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-extrabold">{title}</span>
          {badge ? <Badge variant="success">{badge}</Badge> : null}
        </span>
        <span className="text-[13px] text-muted-foreground">{hint}</span>
      </span>
      {icon ? <IconBox icon={icon} tone={selected ? 'primary' : 'muted'} /> : null}
    </button>
  );
}
