'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import {
  GRID_SLOT_COUNTS,
  SLOT_STYLE_SLIDERS,
  SLOT_VISIBILITY,
  type SlotConfig,
  type SlotStyle,
  type SlotVisibility,
} from './slot-constants';

const SLIDER_LABEL_KEYS: Record<string, string> = {
  'Card width': 'sitePreview.panelCardWidth',
  'Card height': 'sitePreview.panelCardHeight',
  'Card padding': 'sitePreview.panelCardPadding',
  'Grid gap': 'sitePreview.panelGridGap',
};

const SLOT_VISIBILITY_KEYS: Record<string, string> = {
  live: 'sitePreview.panelSlotLive',
  placeholder: 'sitePreview.panelSlotPlaceholder',
  hidden: 'sitePreview.panelSlotHidden',
};

interface SectionSlotEditorProps {
  blockType: string;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

export function SectionSlotEditor({ blockType, cfg, set }: SectionSlotEditorProps) {
  const { t } = useTranslation();
  const count = GRID_SLOT_COUNTS[blockType];
  if (!count) return null;

  const style = (cfg.slotStyle as SlotStyle | undefined) ?? {};
  const slots = (cfg.slots as SlotConfig[] | undefined) ?? [];

  const setStyle = (key: keyof SlotStyle, value: number) =>
    set('slotStyle', { ...style, [key]: value });

  const setSlot = (index: number, patch: Partial<SlotConfig>) => {
    const next: SlotConfig[] = Array.from(
      { length: count },
      (_, i) => slots[i] ?? { visibility: 'live' },
    );
    next[index] = { ...next[index], ...patch };
    set('slots', next);
  };

  return (
    <div className="space-y-3 rounded-md border border-dashed border-zinc-200 p-2.5">
      <span className="text-xs font-medium text-zinc-800">
        {t('sitePreview.panelSlotsAndSizing')}
      </span>

      {/* Section-wide size sliders */}
      <div className="space-y-2">
        {SLOT_STYLE_SLIDERS.map(({ key, label, min, max, step }) => {
          const sliderLabel = SLIDER_LABEL_KEYS[label] ? t(SLIDER_LABEL_KEYS[label]) : label;
          const value = typeof style[key] === 'number' ? (style[key] as number) : undefined;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                  {sliderLabel}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {value != null ? `${value}px` : 'auto'}
                </span>
              </div>
              <input
                type="range"
                aria-label={sliderLabel}
                min={min}
                max={max}
                step={step}
                value={value ?? min}
                onChange={(e) => setStyle(key, Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          );
        })}
      </div>

      {/* Per-slot visibility */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wide text-zinc-600">
          {t('sitePreview.panelSlotVisibility')}
        </span>
        {Array.from({ length: count }, (_, i) => {
          const slot = slots[i] ?? { visibility: 'live' as SlotVisibility };
          return (
            <div key={i} className="space-y-1 rounded border border-zinc-200 p-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 shrink-0 text-[10px] font-medium text-zinc-600">#{i + 1}</span>
                <div className="flex flex-1 gap-1">
                  {SLOT_VISIBILITY.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSlot(i, { visibility: v })}
                      className={`flex-1 rounded border py-0.5 text-[10px] font-medium transition-colors ${
                        slot.visibility === v
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {SLOT_VISIBILITY_KEYS[v] ? t(SLOT_VISIBILITY_KEYS[v]) : v}
                    </button>
                  ))}
                </div>
              </div>
              {slot.visibility === 'placeholder' && (
                <Input
                  value={slot.placeholderText ?? ''}
                  onChange={(e) => setSlot(i, { placeholderText: e.target.value })}
                  placeholder={t('sitePreview.panelPlaceholderTextHint')}
                  className="h-7 border-zinc-300 bg-zinc-100 text-xs text-zinc-900 placeholder:text-zinc-600"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
