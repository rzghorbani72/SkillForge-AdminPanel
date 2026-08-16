'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

export const BRAND_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#64748b',
  '#1e293b'
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
export function BrandColorPicker({
  value,
  onChange,
  label,
  customLabel
}: BrandColorPickerProps) {
  const wheelRef = useRef<HTMLInputElement>(null);
  const isPreset = BRAND_COLORS.some((hex) => hex === value);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex flex-wrap items-center gap-2.5">
        {BRAND_COLORS.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={hex}
            aria-pressed={value === hex}
            onClick={() => onChange(hex)}
            style={{ backgroundColor: hex }}
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
              value === hex
                ? 'scale-110 border-foreground shadow-md'
                : 'border-transparent'
            )}
          />
        ))}

        <button
          type="button"
          title={customLabel}
          aria-label={customLabel}
          onClick={() => wheelRef.current?.click()}
          style={
            isPreset
              ? undefined
              : { backgroundColor: value, backgroundImage: 'none' }
          }
          className={cn(
            'h-8 w-8 rounded-full border-2 bg-[conic-gradient(#ef4444,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#ef4444)] transition-transform hover:scale-110',
            !isPreset
              ? 'scale-110 border-foreground shadow-md'
              : 'border-transparent'
          )}
        />

        <span
          dir="ltr"
          className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
        >
          {value.toUpperCase()}
        </span>
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
