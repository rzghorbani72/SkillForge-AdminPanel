'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

import { CharacterCounter } from '@/components/ui/character-counter';
import { TiptapToolbar } from '@/components/ui/tiptap-toolbar';
import { sanitizeHtml } from '@/lib/sanitize';
import { useTranslation } from '@/lib/i18n/hooks';

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  minRows?: number;
  onInsertImage?: () => Promise<string | null>;
};

/**
 * Rich text editor for long-form article bodies. It keeps HTML, which is what
 * the reader site renders, so nothing is converted on the way in or out.
 *
 * Direction is not fixed: `unicode-bidi: plaintext` lets each paragraph follow
 * its own text, so a Persian post with an English quote in it stays readable
 * without anyone choosing a setting.
 */
export function TiptapEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  disabled,
  minRows = 12,
  onInsertImage
}: TiptapEditorProps) {
  const { t } = useTranslation();
  const emittedRef = React.useRef<string | null>(null);

  const editor = useEditor({
    // Next renders this on the server first; without the flag TipTap warns and
    // can mismatch on hydration.
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      // StarterKit v3 already ships bold/italic/underline/link, so they are
      // configured here rather than registered a second time.
      StarterKit.configure({
        link: { openOnClick: false, autolink: true }
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' })
    ],
    content: value,
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      emittedRef.current = html;
      onChange(html);
    },
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class:
          'rich-editor prose-description w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring',
        style: `min-height: ${minRows * 1.75}rem; unicode-bidi: plaintext;`
      }
    }
  });

  // Only push a value the editor did not just emit, or typing would fight the
  // parent state and the caret would jump to the start on every keystroke.
  React.useEffect(() => {
    if (!editor || value === emittedRef.current) return;
    editor.commands.setContent(sanitizeHtml(value), { emitUpdate: false });
    emittedRef.current = value;
  }, [editor, value]);

  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const handleInsertImage = React.useCallback(async () => {
    if (!editor || !onInsertImage) return;
    const url = await onInsertImage();
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor, onInsertImage]);

  if (!editor) return null;

  const length = editor.getText().length;

  return (
    <div className="space-y-2">
      <TiptapToolbar
        editor={editor}
        disabled={disabled}
        onInsertImage={onInsertImage ? handleInsertImage : undefined}
      />

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">{t('editor.formattingHint')}</p>
        {maxLength != null && (
          <CharacterCounter length={length} maxLength={maxLength} />
        )}
      </div>
    </div>
  );
}
