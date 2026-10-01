'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { AccordionSection } from '../sidebar-primitives';

// ── Theme Mode ────────────────────────────────────────────────────────────────

export function ThemeModeSection({
  darkMode,
  onDarkModeChange,
}: {
  darkMode: boolean | null;
  onDarkModeChange: (m: boolean | null) => void;
}) {
  const { t } = useTranslation();
  const modes: {
    label: string;
    desc: string;
    icon: string;
    value: boolean | null;
  }[] = [
    {
      label: t('sitePreview.themeModeLight'),
      desc: t('sitePreview.themeModeLightDesc'),
      icon: '☀️',
      value: false,
    },
    {
      label: t('sitePreview.themeModeDark'),
      desc: t('sitePreview.themeModeDarkDesc'),
      icon: '🌙',
      value: true,
    },
    {
      label: t('sitePreview.themeModeBoth'),
      desc: t('sitePreview.themeModeBothDesc'),
      icon: '🌗',
      value: null,
    },
  ];

  return (
    <AccordionSection title={t('sitePreview.themeMode')}>
      <div className="space-y-2">
        {modes.map((mode) => (
          <button
            key={mode.label}
            type="button"
            onClick={() => onDarkModeChange(mode.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition-all ${
              darkMode === mode.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <span className="text-base">{mode.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{mode.label}</p>
              <p className="text-[10px] text-zinc-500">{mode.desc}</p>
            </div>
            {darkMode === mode.value && (
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>
    </AccordionSection>
  );
}
