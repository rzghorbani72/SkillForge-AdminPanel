'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

type ToolbarAction = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  run: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

const ACTIONS: ReadonlyArray<ToolbarAction> = [
  {
    id: 'bold',
    icon: Bold,
    labelKey: 'editor.bold',
    run: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive('bold'),
  },
  {
    id: 'italic',
    icon: Italic,
    labelKey: 'editor.italic',
    run: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive('italic'),
  },
  {
    id: 'underline',
    icon: Underline,
    labelKey: 'editor.underline',
    run: (e) => e.chain().focus().toggleUnderline().run(),
    isActive: (e) => e.isActive('underline'),
  },
  {
    id: 'strike',
    icon: Strikethrough,
    labelKey: 'editor.strikethrough',
    run: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive('strike'),
  },
  {
    id: 'h1',
    icon: Heading1,
    labelKey: 'editor.sizeLarge',
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive('heading', { level: 1 }),
  },
  {
    id: 'h2',
    icon: Heading2,
    labelKey: 'editor.sizeMedium',
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive('heading', { level: 2 }),
  },
  {
    id: 'h3',
    icon: Heading3,
    labelKey: 'editor.sizeSmall',
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive('heading', { level: 3 }),
  },
  {
    id: 'bulletList',
    icon: List,
    labelKey: 'editor.bulletList',
    run: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive('bulletList'),
  },
  {
    id: 'orderedList',
    icon: ListOrdered,
    labelKey: 'editor.numberedList',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive('orderedList'),
  },
  {
    id: 'blockquote',
    icon: Quote,
    labelKey: 'editor.quote',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive('blockquote'),
  },
  {
    id: 'alignStart',
    icon: AlignLeft,
    labelKey: 'editor.alignStart',
    run: (e) => e.chain().focus().setTextAlign('start').run(),
    isActive: (e) => e.isActive({ textAlign: 'start' }),
  },
  {
    id: 'alignCenter',
    icon: AlignCenter,
    labelKey: 'editor.alignCenter',
    run: (e) => e.chain().focus().setTextAlign('center').run(),
    isActive: (e) => e.isActive({ textAlign: 'center' }),
  },
  {
    id: 'alignEnd',
    icon: AlignRight,
    labelKey: 'editor.alignEnd',
    run: (e) => e.chain().focus().setTextAlign('end').run(),
    isActive: (e) => e.isActive({ textAlign: 'end' }),
  },
];

type TiptapToolbarProps = {
  editor: Editor;
  disabled?: boolean;
  onInsertImage?: () => void;
};

export function TiptapToolbar({ editor, disabled, onInsertImage }: TiptapToolbarProps) {
  const { t } = useTranslation();

  const handleLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt(t('editor.linkPrompt'), previous ?? 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
      {ACTIONS.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={t(action.labelKey)}
          aria-pressed={action.isActive(editor)}
          title={t(action.labelKey)}
          className={cn('h-8 w-8', action.isActive(editor) && 'bg-accent')}
          onClick={() => action.run(editor)}
        >
          <action.icon className="h-4 w-4" />
        </Button>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        aria-label={t('editor.link')}
        title={t('editor.link')}
        className={cn('h-8 w-8', editor.isActive('link') && 'bg-accent')}
        onClick={handleLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      {onInsertImage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={t('editor.image')}
          title={t('editor.image')}
          className="h-8 w-8"
          onClick={onInsertImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
