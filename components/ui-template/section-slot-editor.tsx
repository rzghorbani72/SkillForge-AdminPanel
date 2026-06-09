'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  GRID_SLOT_COUNTS,
  SLOT_STYLE_SLIDERS,
  SLOT_VISIBILITY,
  type SlotConfig,
  type SlotStyle,
  type SlotVisibility
} from './slot-constants';

interface SectionSlotEditorProps {
  blockType: string;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

// Section-wide card sizing + per-slot three-way visibility for fixed-count grids.
export function SectionSlotEditor({
  blockType,
  cfg,
  set
}: SectionSlotEditorProps) {
  const count = GRID_SLOT_COUNTS[blockType];
  if (!count) return null;

  const style = (cfg.slotStyle as SlotStyle | undefined) ?? {};
  const slots = (cfg.slots as SlotConfig[] | undefined) ?? [];

  const setStyle = (key: keyof SlotStyle, value: number) =>
    set('slotStyle', { ...style, [key]: value });

  const setSlot = (index: number, patch: Partial<SlotConfig>) => {
    const next: SlotConfig[] = Array.from(
      { length: count },
      (_, i) => slots[i] ?? { visibility: 'live' }
    );
    next[index] = { ...next[index], ...patch };
    set('slots', next);
  };

  return (
    <div className="space-y-3 rounded-md border border-dashed p-2.5">
      <Label className="text-xs font-medium">Slots & sizing</Label>

      {/* Section-wide size sliders (clamped) */}
      <div className="space-y-2">
        {SLOT_STYLE_SLIDERS.map(({ key, label, min, max, step }) => {
          const value =
            typeof style[key] === 'number' ? (style[key] as number) : undefined;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {value != null ? `${value}px` : 'auto'}
                </span>
              </div>
              <input
                type="range"
                aria-label={label}
                min={min}
                max={max}
                step={step}
                value={value ?? min}
                onChange={(e) => setStyle(key, Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          );
        })}
      </div>

      {/* Per-slot visibility */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Slot visibility
        </span>
        {Array.from({ length: count }, (_, i) => {
          const slot = slots[i] ?? { visibility: 'live' as SlotVisibility };
          return (
            <div key={i} className="space-y-1 rounded border p-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 shrink-0 text-[10px] font-medium text-muted-foreground">
                  #{i + 1}
                </span>
                <div className="flex flex-1 gap-1">
                  {SLOT_VISIBILITY.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSlot(i, { visibility: v })}
                      className={`flex-1 rounded border py-0.5 text-[10px] font-medium capitalize transition-colors ${
                        slot.visibility === v
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {slot.visibility === 'placeholder' && (
                <Input
                  value={slot.placeholderText ?? ''}
                  onChange={(e) =>
                    setSlot(i, { placeholderText: e.target.value })
                  }
                  placeholder="Placeholder text"
                  className="h-7 text-xs"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
