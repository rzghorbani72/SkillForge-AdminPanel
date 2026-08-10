'use client';

import * as React from 'react';
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pencil,
  Strikethrough,
  Underline
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CharacterCounter } from '@/components/ui/character-counter';
import { Textarea } from '@/components/ui/textarea';
import { renderMarkdown } from '@/lib/markdown';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  applyMarkdownAction,
  type MarkdownAction
} from './markdown-toolbar-actions';

const TOOLBAR: ReadonlyArray<{
  action: MarkdownAction;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}> = [
  { action: 'bold', icon: Bold, labelKey: 'editor.bold' },
  { action: 'italic', icon: Italic, labelKey: 'editor.italic' },
  { action: 'underline', icon: Underline, labelKey: 'editor.underline' },
  { action: 'strike', icon: Strikethrough, labelKey: 'editor.strikethrough' },
  { action: 'heading', icon: Heading2, labelKey: 'editor.heading' },
  { action: 'bulletList', icon: List, labelKey: 'editor.bulletList' },
  {
    action: 'numberedList',
    icon: ListOrdered,
    labelKey: 'editor.numberedList'
  },
  { action: 'link', icon: LinkIcon, labelKey: 'editor.link' }
];

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  minRows?: number;
};

/**
 * A plain textarea that writes Markdown, plus buttons that insert the syntax
 * for the manager. The stored value stays readable text, so nothing breaks if
 * it is shown somewhere that does not render Markdown.
 */
export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  disabled,
  minRows = 4
}: MarkdownEditorProps) {
  const { t } = useTranslation();
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = React.useState(false);

  const runAction = (action: MarkdownAction) => {
    const el = ref.current;
    if (!el) return;
    const result = applyMarkdownAction(
      action,
      value,
      el.selectionStart,
      el.selectionEnd
    );
    if (maxLength != null && result.value.length > maxLength) return;
    onChange(result.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const length = value?.length ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/40 p-1">
        {TOOLBAR.map(({ action, icon: Icon, labelKey }) => (
          <Button
            key={action}
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={disabled || isPreview}
            title={t(labelKey)}
            aria-label={t(labelKey)}
            onClick={() => runAction(action)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ms-auto h-8 gap-1.5"
          disabled={disabled}
          onClick={() => setIsPreview((p) => !p)}
        >
          {isPreview ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isPreview ? t('editor.write') : t('editor.preview')}
        </Button>
      </div>

      {isPreview ? (
        <div
          className="prose-description min-h-[100px] rounded-md border px-3 py-2 text-sm"
          dangerouslySetInnerHTML={{
            __html: value.trim()
              ? renderMarkdown(value)
              : `<p>${t('editor.emptyPreview')}</p>`
          }}
        />
      ) : (
        <Textarea
          ref={ref}
          value={value}
          rows={minRows}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      )}

      <div className="flex items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">{t('editor.formattingHint')}</p>
        {maxLength != null && (
          <CharacterCounter length={length} maxLength={maxLength} />
        )}
      </div>
    </div>
  );
}
