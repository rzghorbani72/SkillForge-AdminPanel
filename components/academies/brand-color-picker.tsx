'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

// Nine well-separated hues plus the colour wheel: two tidy rows of five, and no
// two presets so close together that choosing between them is a decision.
export const BRAND_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#1e293b',
] as const;

export const DEFAULT_BRAND_COLOR = BRAND_COLORS[0];

export interface BrandColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
  customLabel: string;
}

// Preset swatches plus a native color-wheel swatch, so a manager can pick an
// exact brand hex instead of settling for the closest preset.
export function BrandColorPicker({ value, onChange, label, customLabel }: BrandColorPickerProps) {
  const wheelRef = useRef<HTMLInputElement>(null);
  const isPreset = BRAND_COLORS.some((hex) => hex === value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <span
          dir="ltr"
          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {value.toUpperCase()}
        </span>
      </div>

      {/* A fixed grid, not a wrapping row: the swatches must land in the same
          two tidy rows at every dialog width. */}
      <div className="grid w-fit grid-cols-5 gap-2.5">
        {BRAND_COLORS.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={hex}
            aria-pressed={value === hex}
            onClick={() => onChange(hex)}
            style={{ backgroundColor: hex }}
            className={cn(
              'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
              value === hex ? 'scale-110 border-foreground shadow-md' : 'border-transparent',
            )}
          />
        ))}

        <button
          type="button"
          title={customLabel}
          aria-label={customLabel}
          onClick={() => wheelRef.current?.click()}
          style={isPreset ? undefined : { backgroundColor: value, backgroundImage: 'none' }}
          className={cn(
            'h-7 w-7 rounded-full border-2 bg-[conic-gradient(#ef4444,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#ef4444)] transition-transform hover:scale-110',
            !isPreset ? 'scale-110 border-foreground shadow-md' : 'border-transparent',
          )}
        />
      </div>

      <input
        ref={wheelRef}
        type="color"
        aria-label={customLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}
