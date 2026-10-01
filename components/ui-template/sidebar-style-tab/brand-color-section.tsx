'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n/hooks';
import { AccordionSection } from '../sidebar-primitives';
import { ColorPreview } from './color-preview';
import { PaletteCard } from './palette-card';

// Named palettes expose ONLY a primary color. Every other shade (accent,
// background, contrast text) is derived by derivePaletteFromPrimary, so a
// manager can never pick an unreadable primary/background combination.
export const COLOR_PALETTES: { nameKey: string; primary: string }[] = [
  { nameKey: 'sitePreview.paletteOcean', primary: '#3b82f6' },
  { nameKey: 'sitePreview.palettePurple', primary: '#8b5cf6' },
  { nameKey: 'sitePreview.paletteGreen', primary: '#22c55e' },
  { nameKey: 'sitePreview.paletteOrange', primary: '#f97316' },
  { nameKey: 'sitePreview.paletteRed', primary: '#ef4444' },
  { nameKey: 'sitePreview.palettePink', primary: '#ec4899' },
  { nameKey: 'sitePreview.paletteTeal', primary: '#14b8a6' },
  { nameKey: 'sitePreview.paletteGold', primary: '#f59e0b' },
  { nameKey: 'sitePreview.paletteBlack', primary: '#27272a' },
];

export function BrandColorSection({
  primaryColor,
  onColorChange,
}: {
  primaryColor: string;
  onColorChange: (c: string) => void;
}) {
  const { t } = useTranslation();
  const [hexInput, setHexInput] = useState(primaryColor);
  const [showCustom, setShowCustom] = useState(false);

  // Keep the text field in step when the colour changes elsewhere (a palette
  // click, a reset). Adjusting during render, not in an effect, avoids a second
  // paint with the stale value.
  const [lastColor, setLastColor] = useState(primaryColor);
  if (primaryColor !== lastColor) {
    setLastColor(primaryColor);
    setHexInput(primaryColor);
  }

  const commit = (value: string) => {
    setHexInput(value);
    onColorChange(value);
  };

  const applyHex = () => {
    const val = hexInput.trim();
    const normalized = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      commit(normalized);
    }
  };

  const isPreset = COLOR_PALETTES.some(
    (p) => p.primary.toLowerCase() === primaryColor.toLowerCase(),
  );

  return (
    <AccordionSection title={t('sitePreview.colorBrand')} defaultOpen>
      <div className="space-y-3">
        <ColorPreview color={primaryColor} />

        <div className="grid grid-cols-2 gap-1.5">
          {COLOR_PALETTES.map((p) => (
            <PaletteCard
              key={p.primary}
              name={t(p.nameKey)}
              primary={p.primary}
              selected={primaryColor.toLowerCase() === p.primary.toLowerCase()}
              onSelect={() => commit(p.primary)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="text-[11px] font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          {showCustom ? t('sitePreview.colorCustomClose') : t('sitePreview.colorCustomOpen')}
        </button>

        {(showCustom || !isPreset) && (
          <div className="flex items-center gap-2">
            {/* Native picker and hex field write the same value, so a manager
                can either point at a colour or paste a brand code. */}
            <input
              type="color"
              aria-label={t('sitePreview.colorCustom')}
              title={t('sitePreview.colorCustom')}
              value={/^#[0-9a-fA-F]{6}$/.test(primaryColor) ? primaryColor : '#3B82F6'}
              onChange={(e) => commit(e.target.value)}
              className="h-8 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-zinc-300 bg-transparent p-0.5"
            />
            <Input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={applyHex}
              onKeyDown={(e) => e.key === 'Enter' && applyHex()}
              placeholder="#3B82F6"
              dir="ltr"
              className="h-8 flex-1 border-zinc-300 bg-zinc-100 text-xs text-zinc-800 placeholder:text-zinc-600"
            />
          </div>
        )}
      </div>
    </AccordionSection>
  );
}
