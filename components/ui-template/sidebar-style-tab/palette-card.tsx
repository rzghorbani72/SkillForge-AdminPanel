'use client';

import { derivePaletteFromPrimary } from '@/lib/design-system-palette';

export function PaletteCard({
  name,
  primary,
  selected,
  onSelect,
}: {
  name: string;
  primary: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const palette = derivePaletteFromPrimary(primary);
  const swatches = [palette.primary, palette.accent, palette.backgroundLight];

  return (
    <button
      type="button"
      onClick={onSelect}
      title={name}
      className={`flex items-center gap-2 rounded-lg border-2 px-2.5 py-2 transition-all ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400'
      }`}
    >
      <span className="flex flex-shrink-0 overflow-hidden rounded-md border border-black/20">
        {swatches.map((c, i) => (
          <span key={i} className="h-6 w-3.5" style={{ backgroundColor: c }} />
        ))}
      </span>
      <span className="truncate text-xs font-medium text-zinc-800">{name}</span>
    </button>
  );
}
