'use client';

import { derivePaletteFromPrimary } from '@/lib/design-system-palette';
import { useTranslation } from '@/lib/i18n/hooks';

// ── Brand Color ───────────────────────────────────────────────────────────────

// Readable text color for a swatch — white on dark, near-black on light. Keeps
// the preview's button label legible for any primary (e.g. yellow vs navy).
export function readableText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#18181b' : '#ffffff';
}

export const SCHEME_ROLES = [
  { labelKey: 'sitePreview.colorRolePrimary', key: 'primary' as const },
  { labelKey: 'sitePreview.colorRoleAccent', key: 'accent' as const },
  {
    labelKey: 'sitePreview.colorRoleBackground',
    key: 'backgroundLight' as const,
  },
];

// Wix/Zarla-style color-theme preview: a mini storefront swatch rendered with
// the FULL derived scheme (background, text, primary, accent) plus a labelled
// role strip, so the manager sees the whole palette they're applying.
export function ColorPreview({ color }: { color: string }) {
  const { t } = useTranslation();
  const p = derivePaletteFromPrimary(color);
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <div className="px-3 py-2.5" style={{ backgroundColor: p.backgroundLight }} dir="rtl">
        <p className="truncate text-sm font-bold" style={{ color: '#18181b' }}>
          {t('sitePreview.colorPreviewTitle')}
        </p>
        <p className="mb-2 truncate text-[11px]" style={{ color: '#52525b' }}>
          {t('sitePreview.colorPreviewBody')}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-3 py-1 text-[11px] font-semibold"
            style={{ background: p.primary, color: readableText(p.primary) }}
          >
            {t('sitePreview.colorPreviewButton')}
          </span>
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.accent }} />
        </div>
      </div>
      <div className="flex border-t border-zinc-200">
        {SCHEME_ROLES.map(({ labelKey, key }) => (
          <div key={key} className="flex-1 border-r border-zinc-200 last:border-r-0">
            <div className="h-4" style={{ backgroundColor: p[key] }} />
            <p className="py-0.5 text-center text-[8px] text-zinc-500">{t(labelKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
