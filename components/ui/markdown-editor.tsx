'use client';

import * as React from 'react';

import { CharacterCounter } from '@/components/ui/character-counter';
import {
  RichTextToolbar,
  type BlockTag,
  type InlineCommand
} from '@/components/ui/rich-text-toolbar';
import { htmlToMarkdown } from '@/lib/html-to-markdown';
import { renderMarkdown } from '@/lib/markdown';
import { useTranslation } from '@/lib/i18n/hooks';

const TRACKED_COMMANDS: ReadonlyArray<InlineCommand> = [
  'bold',
  'italic',
  'underline',
  'strikeThrough',
  'insertUnorderedList',
  'insertOrderedList'
];

const BLOCK_TAG_BY_NAME: Readonly<Record<string, BlockTag>> = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3'
};

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
 * Visual editor: the manager formats text and sees the result immediately,
 * while the value handed back stays Markdown so everything that already
 * renders descriptions keeps working. Direction is per paragraph and follows
 * the text itself (see `unicode-bidi: plaintext`), so Persian and English
 * lines each align correctly without a setting to get wrong.
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
  const editorRef = React.useRef<HTMLDivElement>(null);
  const emittedRef = React.useRef<string | null>(null);
  const [activeCommands, setActiveCommands] = React.useState<
    ReadonlySet<InlineCommand>
  >(new Set());
  const [activeBlock, setActiveBlock] = React.useState<BlockTag>('p');

  React.useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || value === emittedRef.current) return;
    el.innerHTML = value.trim() ? renderMarkdown(value) : '';
    emittedRef.current = value;
  }, [value]);

  const refreshState = React.useCallback(() => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el || !selection?.anchorNode || !el.contains(selection.anchorNode)) {
      return;
    }
    setActiveCommands(
      new Set(
        TRACKED_COMMANDS.filter((command) =>
          document.queryCommandState(command)
        )
      )
    );
    const block = (
      selection.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : selection.anchorNode.parentElement
    )?.closest('h1,h2,h3,p');
    setActiveBlock(block ? (BLOCK_TAG_BY_NAME[block.tagName] ?? 'p') : 'p');
  }, []);

  React.useEffect(() => {
    document.addEventListener('selectionchange', refreshState);
    return () => document.removeEventListener('selectionchange', refreshState);
  }, [refreshState]);

  const emit = React.useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const markdown = htmlToMarkdown(el.innerHTML);
    emittedRef.current = markdown;
    onChange(markdown);
  }, [onChange]);

  const run = (command: string, argument?: string) => {
    const el = editorRef.current;
    if (!el || disabled) return;
    el.focus();
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand(command, false, argument);
    refreshState();
    emit();
  };

  const handleLink = () => {
    const href = window.prompt(t('editor.linkPrompt'), 'https://');
    if (!href) return;
    run('createLink', href);
  };

  const length = value?.length ?? 0;

  return (
    <div className="space-y-2">
      <RichTextToolbar
        disabled={disabled}
        activeCommands={activeCommands}
        activeBlock={activeBlock}
        onCommand={(command) => run(command)}
        onBlockTag={(tag) => run('formatBlock', tag)}
        onLink={handleLink}
      />

      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        style={{ minHeight: `${minRows * 1.75}rem` }}
        className="rich-editor prose-description w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        onInput={emit}
        onBlur={onBlur}
        onKeyUp={refreshState}
        onMouseUp={refreshState}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
      />

      <div className="flex items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">{t('editor.formattingHint')}</p>
        {maxLength != null && (
          <CharacterCounter length={length} maxLength={maxLength} />
        )}
      </div>
    </div>
  );
}
