'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GRID_SECTION_TEXT_FIELDS } from './slot-constants';

interface TextOverridesEditorProps {
  blockType: string;
  cfg: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}

// Template-level static-text overrides (eyebrows, decorative labels, CTA copy),
// stored under config.text and kept separate from live content.
export function TextOverridesEditor({
  blockType,
  cfg,
  set
}: TextOverridesEditorProps) {
  const fields = GRID_SECTION_TEXT_FIELDS[blockType];
  if (!fields) return null;

  const text = (cfg.text as Record<string, string> | undefined) ?? {};
  const setText = (key: string, value: string) =>
    set('text', { ...text, [key]: value });

  return (
    <div className="space-y-2 rounded-md border border-dashed p-2.5">
      <Label className="text-xs font-medium">Static text</Label>
      {fields.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <Input
            value={text[key] ?? ''}
            onChange={(e) => setText(key, e.target.value)}
            placeholder={label}
            className="h-7 text-xs"
          />
        </div>
      ))}
    </div>
  );
}
