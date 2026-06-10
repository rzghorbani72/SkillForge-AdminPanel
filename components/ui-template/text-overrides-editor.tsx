'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { Input } from '@/components/ui/input';
import { GRID_SECTION_TEXT_FIELDS } from './slot-constants';

const FIELD_LABEL_KEYS: Record<string, string> = {
  'Eyebrow label': 'sitePreview.panelEyebrowLabel',
  Title: 'sitePreview.panelSectionTitle',
  'View-all link': 'sitePreview.panelViewAllLink',
  'View-all button': 'sitePreview.panelViewAllButton',
  'Strip label': 'sitePreview.panelStripLabel'
};

interface TextOverridesEditorProps {
  blockType: string;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

export function TextOverridesEditor({
  blockType,
  cfg,
  set
}: TextOverridesEditorProps) {
  const { t } = useTranslation();
  const fields = GRID_SECTION_TEXT_FIELDS[blockType];
  if (!fields) return null;

  const text = (cfg.text as Record<string, string> | undefined) ?? {};
  const setText = (key: string, value: string) =>
    set('text', { ...text, [key]: value });

  const translateLabel = (label: string): string => {
    const key = FIELD_LABEL_KEYS[label];
    return key ? t(key) : label;
  };

  return (
    <div className="space-y-2 rounded-md border border-dashed border-zinc-700 p-2.5">
      <span className="text-xs font-medium text-zinc-200">
        {t('sitePreview.panelStaticText')}
      </span>
      {fields.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">
            {translateLabel(label)}
          </span>
          <Input
            value={text[key] ?? ''}
            onChange={(e) => setText(key, e.target.value)}
            placeholder={translateLabel(label)}
            className="h-7 border-zinc-600 bg-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
      ))}
    </div>
  );
}
